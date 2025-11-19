// src/components/ProductCard.jsx
import React from "react";
import { useAuthContext } from "../context/AuthProvider";

export default function ProductCard({ product }) {
  const { user } = useAuthContext();

  const addToCart = () => {
    if (!user) {
      alert("Please log in to add items to cart.");
      return;
    }

    alert(`Added ${product.name} to cart!`);
  };

  return (
    <div className="product-card" onClick={addToCart}>
      <img
        src={product.image_url || "https://via.placeholder.com/150"}
        alt={product.name}
      />

      <h3 className="product-card-title">{product.name}</h3>

      <p className="product-card-price">
        ₱{Number(product.price || 0).toFixed(2)}
      </p>
    </div>
  );
}
