import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 🔹 Brand */}
        <div className="footer-brand">
          <h2>
            Prisus<span>.ai</span>
          </h2>
          <p>Your smart study companion for faster revision.</p>
        </div>

        {/* 🔸 Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/features">Features</Link>
            </li>
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </div>

        {/* 🔸 Contact */}
        <div className="footer-contact">
          <h3>Contact</h3>
          <p>
            Email: <a href="mailto:team@prisus.ai">team@prisus.ai</a>
          </p>
          <p>
            Phone: <a href="tel:09136936326">09136936326</a>
          </p>
          <p>
            Twitter:{" "}
            <a href="https://x.com/JamiuNoibi" target="_blank" rel="noreferrer">
              @PrisusAI
            </a>
          </p>
        </div>
      </div>

      {/* © Bottom line */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Prisus.ai — All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
