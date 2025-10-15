import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import mammoth from "mammoth";
import fs from "fs/promises";
import path from "path";
import os from "os";
import PptxParser from "node-pptx-parser";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // ✅ Define before middlewares

// ✅ Basic setup
const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://prisus.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

// ✅ JSON middleware AFTER multer route (important!)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ PDF extraction
async function extractPdfText(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// ✅ PPTX extraction
async function extractPptxText(buffer) {
  const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}.pptx`);
  await fs.writeFile(tempPath, buffer);
  try {
    const parser = new PptxParser();
    await parser.loadFile(tempPath);
    const slides = await parser.parse();
    const text = slides
      .map(
        (slide) =>
          slide.texts?.map((t) => (t.text ? t.text.trim() : "")).join(" ") || ""
      )
      .join("\n\n");
    return text.trim();
  } catch (error) {
    console.error("PPTX parse error:", error.message);
    throw new Error("Could not extract text from PowerPoint file.");
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

// ✅ File text extractor
async function extractText(file) {
  const { buffer, mimetype } = file;
  if (mimetype === "application/pdf") return await extractPdfText(buffer);
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimetype === "application/vnd.ms-powerpoint"
  ) {
    return await extractPptxText(buffer);
  }
  if (mimetype.startsWith("text/")) return buffer.toString("utf-8");
  throw new Error(`Unsupported file type: ${mimetype}`);
}

// ✅ Groq AI generator
async function generateWithGroq(text, mode) {
  if (!GROQ_API_KEY)
    throw new Error("GROQ_API_KEY not configured. Add it to your .env file.");

  const systemPrompt =
    mode === "flashcards"
      ? `You are an expert educational content creator. Create high-quality flashcards from the given text.
Return ONLY valid JSON in this exact format:
{"flashcards": [{"question": "Question?", "answer": "Answer"}]}`
      : `You are an expert quiz creator. Create multiple-choice questions from the given text.
Return ONLY valid JSON in this exact format:
{"quiz": [{"question": "Question?", "options": ["A","B","C","D"], "correct": "A"}]}`;

  const userPrompt = `Text to analyze:\n\n${text.slice(
    0,
    4000
  )}\n\nGenerate the ${mode} in JSON format:`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const aiText = data.choices[0].message.content;
  const clean = aiText.replace(/```json|```/g, "").trim();
  return JSON.parse(clean.match(/\{[\s\S]*\}/)[0]);
}

// ✅ Root
app.get("/", (req, res) => {
  res.json({ message: "✅ Prisus AI backend is running!" });
});

// ✅ Generate endpoint (main fix here)
app.post("/generate", upload.single("file"), async (req, res) => {
  console.log("📦 Received body:", req.body);
  console.log("📎 Received file:", req.file);

  try {
    const { mode } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!mode || !["flashcards", "quiz"].includes(mode))
      return res.status(400).json({ error: "Invalid mode" });

    console.log("📄 Processing:", file.originalname);
    const text = await extractText(file);
    const result = await generateWithGroq(text, mode);
    res.json({ result });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res
      .status(500)
      .json({ error: err.message || "Failed to generate content" });
  }
});

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 GROQ key: ${GROQ_API_KEY ? "✅ Configured" : "❌ Missing"}`);
});
