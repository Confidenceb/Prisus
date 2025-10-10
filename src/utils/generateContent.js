export const generateContent = async (file, mode) => {
  try {
    // Convert uploaded file to text
    const text = await file.text();

    const prompt = `
        Generate ${mode} from the following study material.
        Respond in JSON format only.
        Content:
        ${text}
      `;

    const response = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    throw error;
  }
};
