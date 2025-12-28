import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global reusable BackButton
 *
 * Props:
 * - className: CSS class for styling
 * - fallback: route string when history is empty (default "/")
 * - to: explicit route override (highest priority)
 * - condition: boolean (used with conditionalTo)
 * - conditionalTo: route when condition === true
 * - label: button text (default "← Back")
 */
export default function BackButton({
  className = "back-btn",
  fallback = "/",
  to,
  condition = false,
  conditionalTo,
  label = "← Back",
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    // 1️⃣ Explicit route always wins
    if (to) {
      navigate(to);
      return;
    }

    // 2️⃣ Conditional route (Shop owner case)
    if (condition && conditionalTo) {
      navigate(conditionalTo);
      return;
    }

    // 3️⃣ Normal browser back with safety fallback
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button className={className} onClick={handleBack}>
      {label}
    </button>
  );
}
