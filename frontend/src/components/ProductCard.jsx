// src/components/ProductCard.jsx
import React from "react";
import "../css/components/ProductCard.css";

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img
        src={product.image || "https://via.placeholder.com/150"}
        alt={product.name}
      />
      <h3 className="product-card-title">{product.name}</h3>
      <p className="product-card-price">₱{product.price.toFixed(2)}</p>
    </div>
  );
}
