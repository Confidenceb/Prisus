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

// ✅ Proper CORS setup
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
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// ✅ Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

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
    throw new Error(
      "Could not extract text from PowerPoint file. Try converting to PDF or DOCX first."
    );
  } finally {
    await fs.unlink(tempPath).catch(() => {}); // Cleanup temp file
  }
}

// ✅ Extract text based on file type
async function extractText(file) {
  const { buffer, mimetype, originalname } = file;

  try {
    if (mimetype === "application/pdf") {
      return await extractPdfText(buffer);
    }

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

    if (mimetype.startsWith("text/")) {
      return buffer.toString("utf-8");
    }

    throw new Error(`Unsupported file type: ${mimetype}`);
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
}

// ✅ Generate with Groq AI
async function generateWithGroq(text, mode) {
  if (!GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY not configured. Please add it to your .env file."
    );
  }

  const systemPrompt =
    mode === "flashcards"
      ? `You are an expert educational content creator. Create high-quality flashcards from the given text.
Return ONLY valid JSON in this exact format:
{"flashcards": [{"question": "Clear, specific question?", "answer": "Concise, accurate answer"}]}

Create 8-10 flashcards that cover the main concepts.`
      : `You are an expert quiz creator. Create challenging multiple-choice questions from the given text.
Return ONLY valid JSON in this exact format:
{"quiz": [{"question": "Clear question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": "Option A"}]}

Create 8-10 questions.`;

  const userPrompt = `Text to analyze:\n\n${text.slice(
    0,
    4000
  )}\n\nGenerate the ${mode} in JSON format:`;

  try {
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
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    console.log("🤖 AI Response:", aiText.slice(0, 300));

    let cleanText = aiText.replace(/```json|```/g, "").trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanText = jsonMatch[0];

    const parsed = JSON.parse(cleanText);

    if (mode === "flashcards" && !parsed.flashcards)
      throw new Error("Invalid flashcards format");
    if (mode === "quiz" && !parsed.quiz) throw new Error("Invalid quiz format");

    return parsed;
  } catch (error) {
    console.error("Groq API error:", error.message);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ message: "✅ Prisus AI backend is running!" });
});

// ✅ Generate endpoint
app.post("/generate", upload.single("file"), async (req, res) => {
  try {
    const { mode } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!mode || !["flashcards", "quiz"].includes(mode))
      return res
        .status(400)
        .json({ error: "Invalid mode. Use 'flashcards' or 'quiz'" });

    console.log("📄 Processing file:", file.originalname);
    console.log("📦 File type:", file.mimetype);
    console.log("📏 File size:", (file.size / 1024).toFixed(2), "KB");
    console.log("🎯 Mode:", mode);

    const text = await extractText(file);
    if (!text || text.trim().length === 0)
      return res.status(400).json({
        error:
          "No text content found in file. The file might be empty, corrupted, or image-based.",
      });

    console.log("📝 Extracted text length:", text.length, "characters");
    console.log(
      "📝 Text preview:",
      text.slice(0, 200).replace(/\n/g, " ") + "..."
    );

    console.log("🤖 Generating with Groq AI (Llama 3.3)...");
    const result = await generateWithGroq(text, mode);

    const itemCount =
      mode === "flashcards" ? result.flashcards.length : result.quiz.length;
    console.log(`✅ Generated ${itemCount} ${mode}`);

    res.json({ result });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to generate content",
    });
  }
});

// ✅ Listen on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(
    `🔑 Groq API key: ${GROQ_API_KEY ? "✅ Configured" : "❌ Missing"}`
  );
  console.log(`🤖 Using AI: Llama 3.3 70B (via Groq)`);
  console.log(`💡 Get free API key: https://console.groq.com/keys`);
});
