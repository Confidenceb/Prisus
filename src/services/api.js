// src/services/api.js

const API_URL = import.meta.env.PROD
  ? "https://prisusai-production.up.railway.app"
  : "http://localhost:5000";

export const generateContent = async (file, mode) => {
  try {
    // Create FormData to send file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode); // "flashcards" or "quiz"

    console.log("📤 Sending request to:", `${API_URL}/generate`);
    console.log("📄 File:", file.name);
    console.log("🎯 Mode:", mode);

    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      body: formData, // Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate content");
    }

    const data = await response.json();
    console.log("✅ Received response:", data);

    return data.result; // Returns { flashcards: [...] } or { quiz: [...] }
  } catch (error) {
    console.error("❌ API error:", error);
    throw error;
  }
};
