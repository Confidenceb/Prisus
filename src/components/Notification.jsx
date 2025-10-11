// src/components/Notification.jsx
import React, { useEffect } from "react";
import "./Notification.css";

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClose(), 2500); // auto close after 2.5s
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}
