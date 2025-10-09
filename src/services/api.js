export const generateContent = async (file, mode) => {
  try {
    // Convert file to text
    const text = await file.text();

    // Build the prompt
    const prompt = `Generate ${mode} from the following study material:\n\n${text}`;

    // Send to backend
    const response = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    return data; // { result: "AI text..." }
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};
