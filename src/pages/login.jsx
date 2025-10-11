import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
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
      const user = await loginUser(email, password);
      const updatedUser = {
        ...user,
        displayName: user.displayName || email.split("@")[0],
      };
      setUser(updatedUser);
      setNotif({ message: "Login successful!", type: "success" });
      setLoggedIn(true);
    } catch (err) {
      console.error("Login error:", err);

      // 🧠 No matter what Firebase throws, we keep it user-friendly
      const errorCodes = [
        "auth/invalid-email",
        "auth/invalid-credential",
        "auth/wrong-password",
        "auth/user-not-found",
      ];

      if (errorCodes.includes(err.code)) {
        setNotif({ message: "Invalid Email or Password", type: "error" });
      } else {
        setNotif({
          message: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setNotif({
        message: "Please enter your email before resetting password.",
        type: "error",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setNotif({
        message: `Password reset link sent to ${email}. Check your inbox.`,
        type: "success",
      });
    } catch (err) {
      console.error("Password reset error:", err);
      setNotif({
        message: "Couldn't send reset link. Please check your email.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (loggedIn) navigate("/");
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
          <button
            type="button"
            onClick={handleForgotPassword}
            className="forgot-btn"
          >
            Forgot Password?
          </button>
          <span style={{ margin: "0 6px", color: "#aaa" }}>•</span>
          Don’t have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </section>
  );
}
