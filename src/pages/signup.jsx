// src/pages/Signup.jsx
import "./signup.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../auth";
import Notification from "../components/Notification"; // 👈 import the toast component

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [notif, setNotif] = useState({ message: "", type: "info" }); // 👈 state for notifications
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(email, password);
      setNotif({ message: `Account created for ${fullName}!`, type: "success" });
      setTimeout(() => navigate("/login"), 1500); // ⏳ smooth redirect after showing toast
    } catch (err) {
      console.error("Signup error:", err);
      setNotif({ message: err.message, type: "error" });
    }
  };

  return (
    <section className="signup-page">
      {/* ✅ Notification Toast */}
      <Notification
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ message: "", type: "info" })}
      />

      <div className="signup-container">
        <h1 className="signup-title">Create Your Account</h1>
        <p className="signup-subtext">
          Join Prisus to access educational resources
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="signup-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="signup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="signup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>

        <div className="signup-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </section>
  );
}
