import React, { useState } from "react";
import "./PricingPage.css";

const PricingPage = () => {
  const [billing, setBilling] = useState("monthly");

  const toggleBilling = () => {
    setBilling(billing === "monthly" ? "yearly" : "monthly");
  };

  const plans = [
    {
      name: "Free",
      monthly: 0,
      yearly: 0,
      features: [
        "Basic Flashcards",
        "Limited Quiz Generation",
        "Community Support",
      ],
    },
    {
      name: "Pro",
      monthly: 9,
      yearly: 90,
      features: [
        "Unlimited Flashcards",
        "Advanced Quiz Generator",
        "Priority Support",
      ],
      popular: true,
    },
    {
      name: "Premium",
      monthly: 19,
      yearly: 190,
      features: [
        "Everything in Pro",
        "AI Summaries",
        "Team Collaboration",
        "Early Access Features",
      ],
    },
  ];

  return (
    <main className="pricing-page">
      <section className="pricing-header">
        <h1>Choose the plan that fits you</h1>
        <p>Flexible pricing for learners, teams, and power users</p>

        <div className="billing-toggle">
          <span className={billing === "monthly" ? "active" : ""}>Monthly</span>
          <div className="toggle-switch" onClick={toggleBilling}>
            <div className={`toggle-thumb ${billing}`}></div>
          </div>
          <span className={billing === "yearly" ? "active" : ""}>Yearly</span>
        </div>
      </section>

      <section className="pricing-cards">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`pricing-card ${plan.popular ? "popular" : ""}`}
          >
            {plan.popular && <div className="badge">Most Popular</div>}
            <h2>{plan.name}</h2>
            <p className="price">
              ${billing === "monthly" ? plan.monthly : plan.yearly}
              <span>/{billing === "monthly" ? "mo" : "yr"}</span>
            </p>
            <ul>
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <button className="btn-primary">Get Started</button>
          </div>
        ))}
      </section>

      <section className="comparison-table">
        <h3>Compare features</h3>
        <table>
          <thead>
            <tr>
              <th>Features</th>
              {plans.map((plan, idx) => (
                <th key={idx}>{plan.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              "Basic Flashcards",
              "Unlimited Flashcards",
              "Quiz Generator",
              "Priority Support",
              "AI Summaries",
              "Team Collaboration",
            ].map((feature, i) => (
              <tr key={i}>
                <td>{feature}</td>
                {plans.map((plan, j) => (
                  <td key={j}>
                    {plan.features.includes(feature) ? "✅" : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default PricingPage;
