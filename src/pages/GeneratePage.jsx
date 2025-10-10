import React, { useState } from "react";
import UploadFile from "../components/UploadFile";
import ModeSelector from "../components/ModeSelector";
import FlashcardViewer from "../components/FlashcardViewer";
import QuizSection from "../components/QuizSection";
import "./GeneratePage.css";

const GeneratePage = () => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState(null); // "flashcards" | "quiz"
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset state except file
  const resetState = () => {
    setMode(null);
    setFlashcards([]);
    setQuiz([]);
    setShowQuiz(false);
  };

  // Handle file upload
  const handleFileUpload = (uploadedFile) => {
    console.log("File uploaded:", uploadedFile);
    setFile(uploadedFile);
    resetState();
  };

  // 🔹 Helper function to clean & parse AI JSON safely
  // 🔹 Helper function to clean & parse AI JSON safely
  const parseAIResponse = (rawText) => {
    try {
      // Remove Markdown code block formatting, pipes, and extra symbols
      let cleaned = rawText
        .replace(/```json|```/gi, "")
        .replace(/^[^[{]*(?=[{\[])/, "") // remove junk before first { or [
        .replace(/(?<=[}\]])[^}\]]*$/, "") // remove junk after last } or ]
        .replace(/\|\|/g, "") // remove accidental ||
        .trim();

      // Try parsing directly
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn("⚠️ Failed to parse AI JSON:", err.message, rawText);

      // Try last-resort extraction for nested JSON
      try {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
      } catch (_) {}

      // If everything fails
      alert("Error: Could not parse AI response.");
      return { flashcards: [], quiz: [] };
    }
  };

  // 🔹 Core generator function (for flashcards or quiz)
  const generateFromFile = async (selectedMode) => {
    if (!file) return alert("Please upload a file first.");

    try {
      const text = await file.text();
      const prompt =
        selectedMode === "flashcards"
          ? `Generate clear and detailed flashcards from this content:\n\n${text}`
          : `Generate 5 quiz questions with options and correct answers from this content:\n\n${text}`;

      setLoading(true);
      console.log(`🧠 Generating ${selectedMode}...`);

      const response = await fetch(
        "https://prisusai-production.up.railway.app/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await response.json();
      if (data.error) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error);
        alert("Error: " + msg);
        return null;
      }

      console.log("Raw AI output:", data.result);
      return parseAIResponse(data.result);
    } catch (err) {
      console.error("❌ Generation error:", err);
      alert("Something went wrong while generating.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 When user selects mode
  const handleModeSelection = async (selectedMode) => {
    console.log("Mode selected:", selectedMode);
    setMode(selectedMode);

    const aiOutput = await generateFromFile(selectedMode);
    if (!aiOutput) return;

    if (selectedMode === "flashcards") {
      setFlashcards(aiOutput.flashcards || []);
    } else {
      setQuiz(aiOutput.quiz || []);
      setShowQuiz(true);
    }
  };

  // 🔹 When flashcards end → auto-generate quiz
  const handleFlashcardsDone = async () => {
    console.log("🎯 Flashcards completed, generating quiz next...");
    const aiOutput = await generateFromFile("quiz");

    if (aiOutput && aiOutput.quiz.length > 0) {
      setQuiz(aiOutput.quiz);
      setShowQuiz(true);
    } else {
      alert("Quiz generation failed or returned empty.");
    }
  };

  return (
    <main className="generate-page">
      <div className="generate-center">
        {!file && <UploadFile onFileUpload={handleFileUpload} />}

        {file && (
          <>
            <div className="file-preview">
              <div>
                <strong>Selected:</strong> {file.name}{" "}
                <span className="muted">
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <div className="file-actions">
                <button className="ghost-btn" onClick={() => setFile(null)}>
                  Remove
                </button>
              </div>
            </div>

            {!mode && <ModeSelector onSelectMode={handleModeSelection} />}

            {loading && (
              <div className="loading">⏳ Generating... please wait</div>
            )}

            {mode === "flashcards" && flashcards.length > 0 && !showQuiz && (
              <FlashcardViewer
                cards={flashcards}
                onComplete={handleFlashcardsDone}
              />
            )}

            {showQuiz && quiz.length > 0 && (
              <QuizSection quizData={quiz} onRestart={resetState} />
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default GeneratePage;
