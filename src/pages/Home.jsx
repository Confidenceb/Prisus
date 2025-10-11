// src/pages/Home.jsx
import React from "react";
import "./Home.css";
import Feature from "../components/Feature";
import About from "../components/About";
import Steps from "../components/Steps";
import CTA from "../components/CTA";
import Testimonials from "../components/Testimonials";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/generatepage"); // ✅ Go straight to GeneratePage for everyone
  };

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
          <button
            onClick={handleGetStarted}
            className="get-started-btn animate-grow"
          >
            Get Started
          </button>
        </div>
      </main>
      <Feature />
      <About />
      <Steps />
      <Testimonials />
      <CTA />
    </>
  );
}

export default Home;
