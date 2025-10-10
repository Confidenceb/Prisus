import React, { useState, useEffect } from "react";
import "./FlashcardViewer.css";

const FlashcardViewer = ({ cards, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleNext = () => {
    if (index < cards.length - 1) {
      setIndex(index + 1);
      setShowAnswer(false);
    } else {
      onComplete();
    }
  };

  // ✅ Reset flashcard state when new cards are loaded or component remounts
  useEffect(() => {
    setIndex(0);
    setShowAnswer(false);
  }, [cards]);

  const card = cards[index];

  return (
    <div className="flashcard-viewer">
      <div className="flashcard">
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <p>{card.question}</p>
          </div>
          {showAnswer && (
            <div className="flashcard-back">
              <p>{card.answer}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flashcard-controls">
        {!showAnswer ? (
          <button className="btn-primary" onClick={() => setShowAnswer(true)}>
            Show Answer
          </button>
        ) : (
          <button className="btn-primary" onClick={handleNext}>
            {index === cards.length - 1 ? "Start Quiz" : "Next"}
          </button>
        )}
      </div>

      <div className="flashcard-progress">
        {index + 1}/{cards.length}
      </div>
    </div>
  );
};

export default FlashcardViewer;
