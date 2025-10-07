import { useState } from "react";
import "./QuizSection.css";

export default function QuizSection({ quizData = [], onRestart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!quizData.length) {
    return <div className="quiz-section">No quiz data</div>;
  }

  const currentQ = quizData[currentIndex];

  const handleAnswer = (option) => {
    if (option === currentQ.correct) setScore((prev) => prev + 1);

    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  };

  const getFeedback = () => {
    const percent = (score / quizData.length) * 100;
    if (percent >= 85) return "🌟 Excellent!";
    if (percent >= 70) return "👍 Very Good!";
    if (percent >= 50) return "🙂 Fair";
    return "😕 Poor, try again!";
  };

  if (finished) {
    return (
      <div className="quiz-section">
        <div className="quiz-card result-card">
          <h2>Quiz Completed!</h2>
          <p className="score">
            Your Score: {score}/{quizData.length}
          </p>
          <p className="feedback">{getFeedback()}</p>
          <button className="btn-primary" onClick={onRestart}>
            Start New
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-section">
      <div className="quiz-card">
        <h3 className="quiz-question">{currentQ.question}</h3>
        <div className="quiz-options">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              className="quiz-option"
              onClick={() => handleAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="quiz-progress">
          {currentIndex + 1}/{quizData.length}
        </div>
      </div>
    </div>
  );
}
