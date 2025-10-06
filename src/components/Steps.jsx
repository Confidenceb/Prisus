import React from "react";
import "./Steps.css";
import { Sparkles, FileText, Send } from "lucide-react"; // using lucide icons

const Steps = () => {
  return (
    <section className="steps" id="steps">
      <div className="steps-container">
        <h2 className="steps-title">
          How <span>Prisus.ai</span> Works
        </h2>
        <p className="steps-subtitle">
          Generate smart, customized quizzes in just a few clicks.
        </p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">
              <Sparkles size={32} />
            </div>
            <h3>Step 1: Enter a Topic</h3>
            <p>
              Type in your preferred subject or paste any text. Prisus.ai will
              analyze it intelligently.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">
              <FileText size={32} />
            </div>
            <h3>Step 2: AI Generates Quiz</h3>
            <p>
              Our AI instantly creates relevant and challenging quiz questions
              for you.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">
              <Send size={32} />
            </div>
            <h3>Step 3: Share & Learn</h3>
            <p>
              Download, share, or use your quiz to boost learning and
              engagement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Steps;
