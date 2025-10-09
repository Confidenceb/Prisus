// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { updateProfile, signOut } from "firebase/auth";
import "./profile.css";

export default function Profile() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email] = useState(user?.email || "");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateProfile(user, { displayName });
      setMessage("✅ Profile updated successfully!");
    } catch (error) {
      setMessage("❌ Error updating profile: " + error.message);
    }
    setUpdating(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <section className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title">👤 Your Profile</h1>
        <p className="profile-subtext">Manage your account information below.</p>

        <form onSubmit={handleUpdate} className="profile-form">
          <label>Full Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter full name"
            className="profile-input"
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="profile-input bg-gray-100 cursor-not-allowed"
          />

          <button type="submit" className="update-btn" disabled={updating}>
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </form>

        {message && <div className="profile-message">{message}</div>}

        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </section>
  );
}
