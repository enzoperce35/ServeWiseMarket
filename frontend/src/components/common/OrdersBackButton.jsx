// OrdersBackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function OrdersBackButton({ fromCart }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (fromCart) {
      navigate("/cart");
    } else {
      navigate(-1);
    }
  };

  return (
    <button className="orders-back-btn" onClick={handleBack}>
      ← Back
    </button>
  );
}
