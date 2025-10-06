import React from "react";
import { BrainCircuit, FileText, TrendingUp, Zap } from "lucide-react";
import "./Feature.css";

const Feature = () => {
  return (
    <>
      <section className="features-section animate-fade-in-delayed">
        <div className="features-label">FEATURES</div>
        <h2>Everything you need to excel in your exams</h2>
        <div className="features-grid">
          <div className="feature-card animate-slide-in-left">
            <span className="feature-icon" aria-hidden="true">
              <FileText size={26} strokeWidth={1.6} />
            </span>
            <div>
              <h3>Document Upload</h3>
              <p>
                Upload your study materials in various formats and let our AI
                analyze them.
              </p>
            </div>
          </div>
          <div
            className="feature-card animate-slide-in-right"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="feature-icon" aria-hidden="true">
              <BrainCircuit size={26} strokeWidth={1.6} />
            </span>
            <div>
              <h3>AI-Generated Tests</h3>
              <p>
                Get personalized tests generated based on your study materials.
              </p>
            </div>
          </div>
          <div
            className="feature-card animate-slide-in-left"
            style={{ animationDelay: "0.3s" }}
          >
            <span className="feature-icon" aria-hidden="true">
              <Zap size={26} strokeWidth={1.6} />
            </span>
            <div>
              <h3>Instant Feedback</h3>
              <p>
                Receive immediate feedback on your answers and track your
                progress.
              </p>
            </div>
          </div>
          <div
            className="feature-card animate-slide-in-right"
            style={{ animationDelay: "0.45s" }}
          >
            <span className="feature-icon" aria-hidden="true">
              <TrendingUp size={26} strokeWidth={1.6} />
            </span>
            <div>
              <h3>Progress Tracking</h3>
              <p>
                Monitor your learning progress and identify areas for
                improvement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Feature;
