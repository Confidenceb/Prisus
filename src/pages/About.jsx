import React, { useEffect, useRef, useState } from "react";
import "./About.css";

const AboutPage = () => {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // Function to trigger animation when stats scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
  }, []);

  // Helper for animated count
  const useCountUp = (end, duration, trigger) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      if (!trigger) return;
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
    }, [trigger, duration, end]);
    return count;
  };

  const quizzes = useCountUp(10000, 1200, statsVisible);
  const users = useCountUp(5000, 1200, statsVisible);
  const satisfaction = useCountUp(99, 1200, statsVisible);

  return (
    <section className="about-page" id="about">
      <div className="container">
        {/* HEADER SECTION */}
        <div className="header">
          <h1>
            About <span>Prisus.ai</span>
          </h1>
          <p>
            Prisus.ai is an AI-powered platform transforming the way students
            learn and educators teach. We bring smart automation, simplicity,
            and engagement into the heart of learning through AI-generated
            quizzes and interactive study tools.
          </p>

          {/* Animated Stats */}
          <div className="stats" ref={statsRef}>
            <div className="stat">
              <h3>{statsVisible ? `${quizzes.toLocaleString()}+` : "0"}</h3>
              <p>Quizzes Generated</p>
            </div>
            <div className="stat">
              <h3>{statsVisible ? `${users.toLocaleString()}+` : "0"}</h3>
              <p>Active Users</p>
            </div>
            <div className="stat">
              <h3>{statsVisible ? `${satisfaction}%` : "0%"}</h3>
              <p>User Satisfaction</p>
            </div>
          </div>
        </div>

        {/* MISSION */}
        <div className="section fade-in">
          <h2>Our Mission</h2>
          <p>
            To make learning smarter, faster, and more adaptive for every
            student. Prisus aims to bridge the gap between curiosity and
            comprehension by offering AI tools that make studying engaging and
            effective.
          </p>
        </div>

        {/* VISION */}
        <div className="section slide-up">
          <h2>Our Vision</h2>
          <p>
            We envision an educational ecosystem where every learner has access
            to a personalized study experience — one that evolves with them,
            motivates them, and helps them grow beyond limitations.
          </p>
        </div>

        {/* HOW IT WORKS */}
        <div className="section fade-in">
          <h2>How Prisus Works</h2>
          <ul>
            <li>📘 Upload your content or paste any topic text.</li>
            <li>
              🤖 Our AI instantly generates custom quizzes and flashcards.
            </li>
            <li>📈 Learners track performance with progress insights.</li>
            <li>🔗 Educators can share and collaborate effortlessly.</li>
          </ul>
        </div>

        {/* TEAM */}
        <div className="section slide-up team">
          <h2>Meet the Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <img src="../../public/jamiu.png" alt="Noibi Jamiu" />
              <h3>Noibi Jamiu</h3>
              <p>Frontend & Backend Developer</p>
            </div>
            <div className="team-member">
              <img src="../../public/jamiu.png" alt="Sanusi" />
              <h3>Sanusi</h3>
              <p>Backend & Authentication</p>
            </div>
            <div className="team-member">
              <img src="../../public/jamiu.png" alt="Precious" />
              <h3>Precious</h3>
              <p>Frontend (UI Support)</p>
            </div>
          </div>
        </div>

        {/* WHY PRISUS */}
        <div className="section fade-in">
          <h2>Why Prisus?</h2>
          <p>
            Prisus isn’t just another quiz app — it’s an intelligent learning
            companion. With an adaptive algorithm, clean interface, and instant
            generation capabilities, we redefine how people prepare, teach, and
            test knowledge.
          </p>
        </div>

        {/* CONTACT */}
        <div className="section contact slide-up">
          <h2>Join Us</h2>
          <p>
            Interested in collaborating, partnering, or learning more about our
            work? We’d love to connect.
          </p>
          <a href="mailto:contact@prisus.ai" className="btn">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
