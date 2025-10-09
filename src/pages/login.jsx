// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../auth";
import Notification from "../components/Notification"; 
import "./login.css";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [notif, setNotif] = useState({ message: "", type: "info" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Login form submitted");

      const user = await loginUser(email, password);
      console.log("User after login:", user);

      // 🧩 Force displayName immediately for avatar
      const updatedUser = {
        ...user,
        displayName: user.displayName || email.split("@")[0],
      };

      setUser(updatedUser); // instantly updates navbar avatar
      setNotif({ message: "Login successful!", type: "success" });
      setLoggedIn(true);
    } catch (err) {
      console.error("Login error:", err);
      setNotif({ message: err.message, type: "error" });
    }
  };

  useEffect(() => {
    if (loggedIn) {
      console.log("Redirecting to /");
      navigate("/");
    }
  }, [loggedIn, navigate]);

  return (
    <section className="login-page">
      {/* ✅ Notification Toast */}
      <Notification
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ message: "", type: "info" })}
      />

      <div className="login-container">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtext">Login to continue your Prisus journey</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </section>
  );
}
