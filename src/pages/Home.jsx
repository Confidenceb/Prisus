import React from "react";
import "./Home.css";

import Feature from "../components/Feature";

function Home() {
  return (
    <>
      <main className="hero-section animate-fade-in">
        <div className="hero-content animate-slide-up">
          <h1>
            Transform Your Learning with <br />
            <span className="hero-accent">AI-Powered Education</span>
          </h1>
          <p>
            Upload your study materials and let our AI generate personalized
            tests to help you master any subject.
          </p>
          <button className="get-started-btn animate-grow">Get Started</button>
        </div>
      </main>
      <Feature />
    </>
  );
}

export default Home;
