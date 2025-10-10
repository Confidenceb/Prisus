import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();
const app = express();

// ✅ Proper CORS setup (dynamic whitelist)
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "https://prisus.vercel.app", // Deployed frontend
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

app.use(express.json({ limit: "10mb" })); // allow larger uploads if needed

const PORT = process.env.PORT || 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL || "google/gemma-2-9b-it:free";

// ✅ Root health-check route (keep ONLY ONE)
app.get("/", (req, res) => {
  res.json({ message: "✅ Prisus AI backend is running!" });
});

// ✅ Generate endpoint
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // 🔹 Log model + key presence
    console.log("🧠 Using model:", MODEL);
    console.log("🔑 API key present:", !!OPENROUTER_API_KEY);

    // 🔹 Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `
              You are an AI that creates study materials from any given text.
              Always respond in strict JSON with this structure:
              
              {
                "flashcards": [
                  { "question": "string", "answer": "string" }
                ],
                "quiz": [
                  { "question": "string", "options": ["string", "string", "string"], "correct": "string" }
                ]
              }

              Never include markdown or code fences.
            `,
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data?.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("❌ Empty AI response:", response.data);
      return res.status(500).json({ error: "Empty response from AI model" });
    }

    res.json({ result: aiResponse });
  } catch (error) {
    console.error(
      "❌ Error generating:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

// ✅ Listen on all network interfaces for Railway
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
