import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL || "google/gemma-2-9b-it:free";

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `
        You are an AI that creates study materials from any given text.
        Always respond in **strict JSON** with the following structure:
        
        {
          "flashcards": [
            { "question": "string", "answer": "string" }
          ],
          "quiz": [
            { "question": "string", "options": ["string", "string", "string"], "correct": "string" }
          ]
        }
        
        Never include markdown formatting or code blocks (no \`\`\`json).
        `,
          },
          {
            role: "user",
            content: prompt,
          },
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
      return res.status(500).json({ error: "Empty response from AI model" });
    }

    res.json({ result: aiResponse });
  } catch (error) {
    console.error("Error generating:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || "Error communicating with OpenRouter",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
