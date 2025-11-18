// src/components/ProductCard.jsx
import React from "react";

export default function ProductCard({ product }) {
  // Ensure price is a number
  const price = Number(product.price) || 0;

  // Fallback image
  const imageUrl = product.image_url || "/placeholder.png";

  return (
    <div className="product-card">
      <img src={imageUrl} alt={product.name || "Product"} />
      <h3 className="product-card-title">{product.name || "Unnamed Product"}</h3>
      <p className="product-card-price">${price.toFixed(2)}</p>
    </div>
  );
}
