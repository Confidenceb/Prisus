import React from "react";
import "./CTA.css";

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">
          Ready to <span>Boost Learning</span> with AI?
        </h2>
        <p className="cta-subtitle">
          Join Prisus.ai today and transform the way quizzes are created.
        </p>
        <div className="cta-buttons">
          <button className="cta-btn primary">Join Waitlist</button>
          <button className="cta-btn secondary">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
