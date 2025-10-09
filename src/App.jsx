// src/App.jsx
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // make sure you have this

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import GeneratePage from "./pages/GeneratePage";
import PricingPage from "./pages/PricingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth listener fired:", currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/generatepage" element={user ? <GeneratePage /> : <Navigate to="/login" />} />
        <Route path="/pricing" element={user ? <PricingPage /> : <Navigate to="/login" />} />
<Route
  path="/profile"
  element={user ? <Profile /> : <Navigate to="/login" />}
/>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}
export default App;
