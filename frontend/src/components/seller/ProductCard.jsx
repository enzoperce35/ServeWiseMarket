// src/components/seller/ProductCard.jsx
import React from "react";

export default function ProductCard({ product, onEdit, onDelete }) {
  // Ensure price is always a number
  const price = Number(product.price || 0);

  // Fallbacks for optional fields
  const description = product.description || "No description";
  const imageUrl = product.image_url || "/images/default-product.png";
  const nextAvailable = product.next_available_date || "N/A";
  const stock = product.stock ?? 0;
  const status = product.status || "unknown";

  return (
    <div className="seller-product-card">
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
        <p>
          <strong>Status:</strong> {status}
        </p>
        {product.featured && <span className="seller-badge">Featured</span>}
      </div>

      <div className="flex space-x-2 mt-2">
        <button
          className="seller-btn seller-btn-primary"
          onClick={() => onEdit(product)}
        >
          Edit
        </button>
        <button
          className="seller-btn seller-btn-danger"
          onClick={() => onDelete(product.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
