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

// ✅ Define multer BEFORE JSON middlewares
const upload = multer({ storage: multer.memoryStorage() });

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://prisus.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
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

// ✅ JSON middlewares AFTER multer definition
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 🧩 Utility functions
async function extractPdfText(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractPptxText(buffer) {
  // Write buffer to temp file
  const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}.pptx`);
  await fs.writeFile(tempPath, buffer);
  try {
    // Correct instantiation according to library docs
    const parser = new PptxParser(tempPath);
    // Extract text from all slides
    const slideTexts = await parser.extractText();
    return slideTexts.join("\n\n").trim();
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

async function extractText(file) {
  const { buffer, mimetype } = file;
  if (mimetype === "application/pdf") return await extractPdfText(buffer);

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // ✅ Mammoth expects { buffer: Buffer }
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

async function generateWithGroq(text, mode) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
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
  const clean = aiText.replace(/``````/g, "").trim();
  return JSON.parse(clean.match(/\{[\s\S]*\}/)[0]);
}

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ message: "✅ Prisus AI backend is running!" });
});

// ✅ Upload route
app.post("/generate", upload.single("file"), async (req, res) => {
  console.log("📦 Body:", req.body);
  console.log("📎 File:", req.file);

  try {
    const { mode } = req.body;
    const file = req.file;

    if (!file) {
      console.log("❌ No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!mode || !["flashcards", "quiz"].includes(mode)) {
      return res.status(400).json({ error: "Invalid mode" });
    }

    console.log(`📄 Processing ${file.originalname} (${file.mimetype})...`);
    const text = await extractText(file);
    const result = await generateWithGroq(text, mode);
    res.json({ result });
  } catch (err) {
    console.error("❌ Error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to generate content" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
