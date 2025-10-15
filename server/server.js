import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import mammoth from "mammoth";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// ✅ handle CommonJS-only modules
const pdfParse = require("pdf-parse");

// ✅ Fix for node-pptx-parser import (CommonJS)
let PptxParser;
try {
  const parserModule = require("node-pptx-parser");
  PptxParser = parserModule.default || parserModule;
} catch (err) {
  console.warn("⚠️ node-pptx-parser not found. PPTX parsing will be disabled.");
}

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://prisus.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors()); // preflight handler

// ✅ Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// 🧠 PDF extractor
async function extractPdfText(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// 🧠 PPTX extractor
async function extractPptxText(buffer) {
  if (!PptxParser) {
    throw new Error("PPTX parsing not available. Missing node-pptx-parser.");
  }

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
    console.error("⚠️ PPTX parse error:", error.message);
    throw new Error(
      "Could not extract text from PowerPoint file. Try converting to PDF or DOCX first."
    );
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

// 🧠 Extract text dynamically based on file type
async function extractText(file) {
  const { buffer, mimetype } = file;
  try {
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
  } catch (error) {
    console.error("❌ Error extracting text:", error.message);
    throw error;
  }
}

// 🧠 Generate with Groq API
async function generateWithGroq(text, mode) {
  if (!GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY in .env");
  }

  const systemPrompt =
    mode === "flashcards"
      ? `You are an expert educational content creator. Create high-quality flashcards from the given text.
Return ONLY valid JSON in this exact format:
{"flashcards": [{"question": "Question?", "answer": "Answer"}]}`
      : `You are an expert quiz creator. Create multiple-choice questions from the given text.
Return ONLY valid JSON in this exact format:
{"quiz": [{"question": "Question?", "options": ["A", "B", "C", "D"], "correct": "A"}]}`;

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
  let cleanText = aiText.replace(/```json|```/g, "").trim();
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleanText = jsonMatch[0];
  return JSON.parse(cleanText);
}

// ✅ Root
app.get("/", (req, res) => {
  res.json({ message: "✅ Prisus AI backend is running!" });
});

// ✅ Generate
app.post("/generate", upload.single("file"), async (req, res) => {
  try {
    const { mode } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!mode || !["flashcards", "quiz"].includes(mode))
      return res.status(400).json({ error: "Invalid mode" });

    console.log("📄 File received:", file.originalname, "| Mode:", mode);

    const text = await extractText(file);
    const result = await generateWithGroq(text, mode);

    res.json({ result });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(
    `🔑 Groq API Key: ${GROQ_API_KEY ? "✅ Configured" : "❌ Missing"}`
  );
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(", ")}`);
});
