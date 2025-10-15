import React from "react";
import "./About.css";

const About = () => {
  return (
    <section className="about" id="about">
      <div className="about-container">
        <h2 className="about-title">
          About <span>Prisus.ai</span>
        </h2>
        <p className="about-text">
          Prisus.ai is an AI-powered platform that helps educators and learners
          generate smart quizzes in seconds. Whether you're preparing for a test
          or building an interactive learning experience, Prisus.ai gives you
          the tools to create, customize, and share quizzes effortlessly.
        </p>

        <div className="about-stats">
          <div className="stat">
            <h3>10k+</h3>
            <p>Quizzes Generated</p>
          </div>
          <div className="stat">
            <h3>5k+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat">
            <h3>99%</h3>
            <p>User Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
