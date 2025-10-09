// src/pages/GeneratePage.jsx
import React, { useState } from "react";
import UploadFile from "../components/UploadFile";
import ModeSelector from "../components/ModeSelector";
import FlashcardViewer from "../components/FlashcardViewer";
import QuizSection from "../components/QuizSection";
import { generateContent } from "../services/api";
import "./GeneratePage.css";

const GeneratePage = () => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleFileUpload = (uploadedFile) => {
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

  // Handle mode selection
  const handleModeSelection = async (selectedMode) => {
    setMode(selectedMode);
    setLoading(true);

    try {
      const result = await generateContent(file, selectedMode);
      const aiText = result.result || "No response from AI.";

      if (selectedMode === "flashcards") {
        const flashcardsList = aiText
          .split("---")
          .map((item) => {
            const parts = item.split("**Back:**");
            if (parts.length === 2) {
              return {
                question: parts[0].replace("**Front:**", "").trim(),
                answer: parts[1].trim(),
              };
            }
            return null;
          })
          .filter(Boolean);

        setFlashcards(flashcardsList);
      } else if (selectedMode === "quiz") {
        setQuiz([
          {
            question: "Generated Quiz",
            options: ["See details below"],
            correct: aiText,
          },
        ]);
        setShowQuiz(true);
      }
    } catch (err) {
      console.error("Error generating content:", err);
      alert("Something went wrong generating content. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle transition from flashcards → quiz
  const handleFlashcardsDone = () => {
    setShowQuiz(true);
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

            {!mode && (
              <ModeSelector onSelectMode={handleModeSelection} disabled={loading} />
            )}

            {loading && <p className="loading">⚙️ Generating content...</p>}

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
