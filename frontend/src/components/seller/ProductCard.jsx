// src/components/seller/ProductCard.jsx
import React from "react";

export default function ProductCard({ product, onClick }) {
  // Ensure price is always a number
  const price = Number(product.price || 0);

  // Fallbacks for optional fields
  const description = product.description || "No description";
  const imageUrl = product.image_url || "/images/default-product.png";
  const stock = product.stock ?? 0;
  const nextAvailable = product.next_available_date || "N/A";

  return (
    <div className="seller-product-card clickable-card" onClick={onClick}>
      <img src={imageUrl} alt={product.name} className="seller-product-img" />
      <div className="seller-product-info">
        <h3>{product.name}</h3>
        <p>{description}</p>
        <p>
          <strong>Price:</strong> ₱{price.toFixed(2)}
        </p>
        <p>
          <strong>Stock:</strong> {stock}
        </p>
        {product.availability_type === "pre_order" && (
          <p>
            <strong>Next Available:</strong> {nextAvailable}
          </p>
        )}
      </div>
    </div>
  );
}
