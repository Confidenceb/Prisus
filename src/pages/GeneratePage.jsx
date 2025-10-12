// src/pages/GeneratePage.jsx
import React, { useState } from "react";
import UploadFile from "../components/UploadFile";
import ModeSelector from "../components/ModeSelector";
import FlashcardViewer from "../components/FlashcardViewer";
import QuizSection from "../components/QuizSection";
import Notification from "../components/Notification"; // 👈 import toast
import "./GeneratePage.css";

const GeneratePage = ({ user }) => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ message: "", type: "info" }); // 👈 notification state

  // Handle file upload
  const handleFileUpload = (uploadedFile) => {
    // 🚫 Stop anonymous uploads
    if (!user) {
      setNotif({
        message: "Please log in to upload files.",
        type: "error",
      });
      return;
    }

    console.log("File uploaded:", uploadedFile);
    setFile(uploadedFile);
    resetState();
  };

  // Reset state except file
  const resetState = () => {
    setMode(null);
    setFlashcards([]);
    setQuiz([]);
    setShowQuiz(false);
  };

  // Helper function to clean & parse AI JSON safely
  const parseAIResponse = (rawText) => {
    try {
      let cleaned = rawText
        .replace(/```json|```/gi, "")
        .replace(/^[^[{]*(?=[{\[])/, "")
        .replace(/(?<=[}\]])[^}\]]*$/, "")
        .replace(/\|\|/g, "")
        .trim();

      return JSON.parse(cleaned);
    } catch (err) {
      console.warn("⚠️ Failed to parse AI JSON:", err.message, rawText);
      try {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
      } catch (_) {}
      setNotif({
        message: "Error: Could not parse AI response.",
        type: "error",
      });
      return { flashcards: [], quiz: [] };
    }
  };

  // Core generator function (for flashcards or quiz)
  const generateFromFile = async (selectedMode) => {
    if (!file) {
      setNotif({
        message: "Please upload a file first.",
        type: "error",
      });
      return null;
    }

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
        setNotif({ message: "Error: " + msg, type: "error" });
        return null;
      }

      console.log("Raw AI output:", data.result);
      return parseAIResponse(data.result);
    } catch (err) {
      console.error("❌ Generation error:", err);
      setNotif({
        message: "Something went wrong while generating.",
        type: "error",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // When user selects mode
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

  // When flashcards end → auto-generate quiz
  const handleFlashcardsDone = async () => {
    console.log("🎯 Flashcards completed, generating quiz next...");
    const aiOutput = await generateFromFile("quiz");

    if (aiOutput && aiOutput.quiz.length > 0) {
      setQuiz(aiOutput.quiz);
      setShowQuiz(true);
    } else {
      setNotif({
        message: "Quiz generation failed or returned empty.",
        type: "error",
      });
    }
  };

  return (
    <main className="generate-page">
      {/* ✅ Notification Toast */}
      <Notification
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ message: "", type: "info" })}
      />

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

            {!mode && (
              <ModeSelector
                onSelectMode={handleModeSelection}
                disabled={loading}
              />
            )}

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
