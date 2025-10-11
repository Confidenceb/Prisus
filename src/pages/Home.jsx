// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "./Home.css";

import Feature from "../components/Feature";
import About from "../components/About";
import Steps from "../components/Steps";
import CTA from "../components/CTA";
import Testimonials from "../components/Testimonials";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Watch for user login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleGetStarted = () => {
    if (user) {
      console.log("User logged in, navigating to GeneratePage...");
      navigate("/generatepage");
    } else {
      console.log("User not logged in, redirecting to Login...");
      navigate("/login");
    }
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
            className="get-started-btn animate-grow"
            onClick={handleGetStarted}
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
