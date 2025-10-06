import React from "react";
import "./Testimonials.css";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Medical Student",
    message:
      "Prisus.ai completely changed the way I study! Flashcards and quizzes are ready in seconds. No more late nights creating questions manually.",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "David Kim",
    role: "Computer Science Undergraduate",
    message:
      "The quiz generation is 🔥. It actually summarizes complex notes accurately. Makes revision so much faster.",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    name: "Amaka Obi",
    role: "Chemistry Student",
    message:
      "I love the clean UI and how easy it is to navigate. Prisus.ai is like having a smart study buddy with me.",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h2 className="testimonials-title">What Students Are Saying ✨</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, index) => (
            <div className="testimonial-card" key={index}>
              <div className="testimonial-avatar">
                <img src={t.avatar} alt={t.name} />
              </div>
              <p className="testimonial-message">“{t.message}”</p>
              <h4 className="testimonial-name">{t.name}</h4>
              <span className="testimonial-role">{t.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
