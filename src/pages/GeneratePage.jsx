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

  // ✅ Sample data for testing
  const sampleFlashcards = [
    {
      question: "What is React?",
      answer: "A JavaScript library for building UIs.",
    },
    {
      question: "What is JSX?",
      answer: "A syntax extension for JavaScript.",
    },
  ];

  const sampleQuiz = [
    {
      question: "React is primarily used for?",
      options: ["Styling", "UI", "Databases"],
      correct: "UI",
    },
    {
      question: "JSX allows you to write?",
      options: ["Python", "HTML in JS", "SQL"],
      correct: "HTML in JS",
    },
  ];

  // ✅ Handle file upload
  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
    resetState();
  };

  // ✅ Reset state except file
  const resetState = () => {
    setMode(null);
    setFlashcards([]);
    setQuiz([]);
    setShowQuiz(false);
  };

  // ✅ Handle mode selection
  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);

    // Simulate generation process (AI or backend)
    if (selectedMode === "flashcards") {
      setFlashcards(sampleFlashcards);
    } else if (selectedMode === "quiz") {
      setQuiz(sampleQuiz);
      setShowQuiz(true);
    }
  };

  // ✅ Handle transition from flashcards → quiz
  const handleFlashcardsDone = () => {
    setQuiz(sampleQuiz);
    setShowQuiz(true);
  };

  return (
    <main className="generate-page">
      <div className="generate-center">
        {/* 📂 Upload Section */}
        {!file && <UploadFile onFileUpload={handleFileUpload} />}

        {/* 📝 File Preview */}
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

            {/* ⚡ Mode Selection */}
            {!mode && <ModeSelector onSelectMode={handleModeSelection} />}

            {/* 🃏 Flashcard Viewer */}
            {mode === "flashcards" && flashcards.length > 0 && !showQuiz && (
              <FlashcardViewer
                cards={flashcards}
                onComplete={handleFlashcardsDone}
              />
            )}

            {/* 🧠 Quiz Section */}
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
