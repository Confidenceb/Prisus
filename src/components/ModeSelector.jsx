import React from "react";
import "./ModeSelector.css";

const ModeSelector = ({ onSelectMode }) => {
  return (
    <div className="mode-selector">
      <h2 className="mode-title">Select What to Generate</h2>
      <p className="mode-sub">Choose how you want to study 👇</p>

      <div className="mode-buttons">
        <button
          className="mode-btn flashcards"
          onClick={() => onSelectMode("flashcards")}
        >
          🧠 Flashcards First
        </button>
        <button className="mode-btn quiz" onClick={() => onSelectMode("quiz")}>
          📝 Quiz Only
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
