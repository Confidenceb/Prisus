import React, { useState } from "react";
import UploadFile from "../components/UploadFile";
import ModeSelector from "../components/ModeSelector";
import FlashcardViewer from "../components/FlashcardViewer";
import QuizSection from "../components/QuizSection";
<<<<<<< HEAD
import { generateContent } from "../services/api";
=======
>>>>>>> 57969f369d4dce7e4c1b0ebbdef31d60ab92a0f4
import "./GeneratePage.css";

const GeneratePage = () => {
  const [file, setFile] = useState(null);
<<<<<<< HEAD
  const [mode, setMode] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
=======
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
>>>>>>> 57969f369d4dce7e4c1b0ebbdef31d60ab92a0f4

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
<<<<<<< HEAD
  const handleModeSelection = async (selectedMode) => {
    setMode(selectedMode);

    try {
      const result = await generateContent(file, selectedMode);

      // Backend returns { result: "AI text..." }
      const aiText = result.result || "No response from AI.";

      if (selectedMode === "flashcards") {
        // Split into pseudo flashcards for display
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
        // Treat response as one quiz block
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
=======
  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);

    // Simulate generation process (AI or backend)
    if (selectedMode === "flashcards") {
      setFlashcards(sampleFlashcards);
    } else if (selectedMode === "quiz") {
      setQuiz(sampleQuiz);
      setShowQuiz(true);
>>>>>>> 57969f369d4dce7e4c1b0ebbdef31d60ab92a0f4
    }
  };

  // ✅ Handle transition from flashcards → quiz
  const handleFlashcardsDone = () => {
<<<<<<< HEAD
=======
    setQuiz(sampleQuiz);
>>>>>>> 57969f369d4dce7e4c1b0ebbdef31d60ab92a0f4
    setShowQuiz(true);
  };

  return (
    <main className="generate-page">
      <div className="generate-center">
<<<<<<< HEAD
        {!file && <UploadFile onFileUpload={handleFileUpload} />}

=======
        {/* 📂 Upload Section */}
        {!file && <UploadFile onFileUpload={handleFileUpload} />}

        {/* 📝 File Preview */}
>>>>>>> 57969f369d4dce7e4c1b0ebbdef31d60ab92a0f4
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

<<<<<<< HEAD
            {!mode && (
              <ModeSelector
                onSelectMode={handleModeSelection}
                disabled={loading}
              />
            )}

            {loading && <p className="loading">⚙️ Generating content...</p>}

=======
            {/* ⚡ Mode Selection */}
            {!mode && <ModeSelector onSelectMode={handleModeSelection} />}

            {/* 🃏 Flashcard Viewer */}
>>>>>>> 57969f369d4dce7e4c1b0ebbdef31d60ab92a0f4
            {mode === "flashcards" && flashcards.length > 0 && !showQuiz && (
              <FlashcardViewer
                cards={flashcards}
                onComplete={handleFlashcardsDone}
              />
            )}

<<<<<<< HEAD
=======
            {/* 🧠 Quiz Section */}
>>>>>>> 57969f369d4dce7e4c1b0ebbdef31d60ab92a0f4
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
