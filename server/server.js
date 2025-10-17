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

// ✅ Fix PDF Parse import - Try multiple methods
let pdfParse;
try {
  pdfParse = require("pdf-parse");
  // Test if it's actually a function
  if (typeof pdfParse !== "function") {
    pdfParse = pdfParse.default;
  }
  console.log("✅ pdf-parse loaded successfully");
} catch (err) {
  console.error("⚠️ pdf-parse load error:", err.message);
}

// Fallback PDF parser using pdf2json
let pdf2json;
try {
  pdf2json = require("pdf2json");
  console.log("✅ pdf2json loaded successfully");
} catch (err) {
  console.error("⚠️ pdf2json load error:", err.message);
}

// ✅ Fix PPTX Parser import
let extractPptx;
try {
  const officeparser = require("officeparser");
  extractPptx = officeparser.parseOfficeAsync;
} catch (err) {
  console.warn("⚠️ officeparser not found. PPTX parsing will be disabled.");
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

app.options("*", cors());

// ✅ Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// 🧠 PDF extractor - FIXED with fallback
async function extractPdfText(buffer) {
  if (!pdfParse && !pdf2json) {
    throw new Error(
      "PDF parsing not available. Install: npm install pdf-parse pdf2json"
    );
  }

  // Try pdf-parse first
  if (pdfParse) {
    try {
      console.log("📄 Attempting PDF extraction with pdf-parse...");
      const data = await pdfParse(buffer, {
        // Options to handle various PDF types
        max: 0, // Parse all pages
        version: "v1.10.100",
      });

      if (data.text && data.text.trim().length > 0) {
        console.log(
          "✅ PDF extracted successfully:",
          data.text.length,
          "chars"
        );
        return data.text;
      }
      console.log("⚠️ pdf-parse returned empty text, trying fallback...");
    } catch (error) {
      console.error("⚠️ pdf-parse failed:", error.message);
      console.log("Trying fallback method...");
    }
  }

  // Fallback to pdf2json
  if (pdf2json) {
    try {
      console.log("📄 Attempting PDF extraction with pdf2json...");
      return await extractPdfWithPdf2Json(buffer);
    } catch (error) {
      console.error("⚠️ pdf2json also failed:", error.message);
    }
  }

  throw new Error(
    "Failed to extract text from PDF. The file might be corrupted, password-protected, or image-based (scanned). Try converting it to DOCX first."
  );
}

// Fallback PDF extractor using pdf2json
async function extractPdfWithPdf2Json(buffer) {
  return new Promise((resolve, reject) => {
    const tempPath = path.join(os.tmpdir(), `pdf-${Date.now()}.pdf`);

    fs.writeFile(tempPath, buffer)
      .then(() => {
        const pdfParser = new pdf2json();

        pdfParser.on("pdfParser_dataError", (errData) => {
          fs.unlink(tempPath).catch(() => {});
          reject(new Error(errData.parserError));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          try {
            let text = "";

            // Extract text from all pages
            if (pdfData.Pages) {
              pdfData.Pages.forEach((page) => {
                if (page.Texts) {
                  page.Texts.forEach((textItem) => {
                    if (textItem.R) {
                      textItem.R.forEach((r) => {
                        if (r.T) {
                          text += decodeURIComponent(r.T) + " ";
                        }
                      });
                    }
                  });
                  text += "\n";
                }
              });
            }

            fs.unlink(tempPath).catch(() => {});

            if (text.trim().length === 0) {
              reject(
                new Error(
                  "PDF appears to be empty or image-based (no extractable text)"
                )
              );
            } else {
              console.log(
                "✅ PDF extracted with pdf2json:",
                text.length,
                "chars"
              );
              resolve(text.trim());
            }
          } catch (err) {
            fs.unlink(tempPath).catch(() => {});
            reject(err);
          }
        });

        pdfParser.loadPDF(tempPath);
      })
      .catch(reject);
  });
}

// 🧠 PPTX extractor - FIXED with officeparser
async function extractPptxText(buffer) {
  if (!extractPptx) {
    throw new Error(
      "PPTX parsing not available. Install officeparser: npm install officeparser"
    );
  }

  const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}.pptx`);

  try {
    await fs.writeFile(tempPath, buffer);
    const text = await extractPptx(tempPath);
    return text.trim();
  } catch (error) {
    console.error("⚠️ PPTX parse error:", error.message);
    throw new Error(
      "Could not extract text from PowerPoint file. The file might be corrupted."
    );
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

// 🧠 Extract text dynamically based on file type
async function extractText(file) {
  const { buffer, mimetype, originalname } = file;

  try {
    // PDF
    if (mimetype === "application/pdf") {
      return await extractPdfText(buffer);
    }

    // DOCX
    if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    // PPTX
    if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      mimetype === "application/vnd.ms-powerpoint"
    ) {
      return await extractPptxText(buffer);
    }

    // Plain text files
    if (mimetype.startsWith("text/") || originalname.endsWith(".txt")) {
      return buffer.toString("utf-8");
    }

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

  // Limit text size to avoid token limits
  const maxChars = 8000;
  const truncatedText = text.length > maxChars ? text.slice(0, maxChars) : text;

  const systemPrompt =
    mode === "flashcards"
      ? `You are an expert educational content creator. Create high-quality flashcards from the given text.
Return ONLY valid JSON in this exact format:
{"flashcards": [{"question": "Question?", "answer": "Answer"}]}
Create at least 10 flashcards covering the key concepts.`
      : `You are an expert quiz creator. Create multiple-choice questions from the given text.
Return ONLY valid JSON in this exact format:
{"quiz": [{"question": "Question?", "options": ["A", "B", "C", "D"], "correct": "A"}]}
Create at least 10 questions covering the key concepts.`;

  const userPrompt = `Text to analyze:\n\n${truncatedText}\n\nGenerate the ${mode} in JSON format:`;

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
        max_tokens: 3000,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const aiText = data.choices[0].message.content;

  // Clean and parse JSON
  let cleanText = aiText.replace(/```json|```/g, "").trim();
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleanText = jsonMatch[0];

  return JSON.parse(cleanText);
}

// ✅ Root
app.get("/", (req, res) => {
  res.json({ message: "✅ Prisus AI backend is running!" });
});

// ✅ Generate endpoint
app.post("/generate", upload.single("file"), async (req, res) => {
  try {
    const { mode } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!mode || !["flashcards", "quiz"].includes(mode)) {
      return res
        .status(400)
        .json({ error: "Invalid mode. Use 'flashcards' or 'quiz'" });
    }

    console.log(
      "📄 File received:",
      file.originalname,
      "| Mode:",
      mode,
      "| Size:",
      file.size
    );

    const text = await extractText(file);

    if (!text || text.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Not enough text content found in the file" });
    }

    console.log("✅ Text extracted:", text.length, "characters");

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
  console.log(`📦 PDF Support: ${pdfParse || pdf2json ? "✅" : "❌"}`);
  console.log(`📦 PPTX Support: ${extractPptx ? "✅" : "❌"}`);
});
