import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Navbar.css";
import { logoutUser } from "../auth";

const Navbar = ({ user, setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // 🧠 Generate avatar URL based on user name or email
  const avatarUrl = user
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.displayName || user.email || "User"
      )}&background=4b2b8a&color=fff`
    : null;

  return (
    <nav className="navbar">
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          Prisus<span>.ai</span>
        </Link>

        {/* Hamburger Icon */}
        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          {menuOpen ? (
            <X size={24} strokeWidth={1.9} />
          ) : (
            <Menu size={24} strokeWidth={1.9} />
          )}
        </button>

        {/* Nav Links */}
        <ul
          id="primary-navigation"
          className={`nav-links ${menuOpen ? "open" : ""}`}
        >
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/generatepage" onClick={() => setMenuOpen(false)}>
              Generate Page
            </Link>
          </li>
          <li>
            <Link to="/pricing" onClick={() => setMenuOpen(false)}>
              Pricing
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setMenuOpen(false)}>
              About
            </Link>
          </li>

          {/* Conditional Links Based on Login State */}
          {user ? (
            <>
              <li className="nav-avatar">
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  <img src={avatarUrl} alt="User Avatar" className="avatar-img" />
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="login-btn logout-btn"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                to="/login"
                className="login-btn"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
