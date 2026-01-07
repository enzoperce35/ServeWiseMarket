import React from "react";
import "../../css/components/seller/SellerCard.css";

export default function SellerCard({ product, onClick, onStatusClick, groupId }) {
  const price = Number(product.price || 0);
  const stock = product.stock ?? 0;
  const imageUrl = product.image_url || "/images/default-product.png";

  // Check if the product is active in THIS delivery group
  const isActive = (product.product_delivery_groups || []).some(
    (dg) => dg.active && dg.delivery_group_id === groupId
  );

  const getStatusColor = () => {
    if (stock <= 0) return "#ccc";
    return isActive ? "green" : "#ccc";
  };

  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (!groupId) return; // Skip "No Group" products
    onStatusClick?.(product, groupId);
  };

  return (
    <div
      className={`seller-product-card clickable-card ${
        stock <= 0 ? "out-of-stock-product" : ""
      }`}
      onClick={onClick}
    >
      <div className="seller-product-img-wrapper">
        <img src={imageUrl} alt={product.name} className="seller-product-img" />

        {groupId && (
          <span className="status-dot-wrapper" onClick={handleStatusClick}>
            <span
              className="status-dot"
              style={{ backgroundColor: getStatusColor() }}
              title={isActive ? "Active in group" : "Inactive in group"}
            />
          </span>
        )}
      </div>

      <div className="seller-product-name">
        <h3>{product.name}</h3>
        <div className="price-stock-container">
          <p className="price-stock">
            <strong>Price:</strong> ₱{price.toFixed(2)}
          </p>
          <p
            className="price-stock"
            style={{ color: stock <= 0 ? "red" : "inherit" }}
          >
            <strong>Stock:</strong> {stock}
          </p>
        </div>
      </div>
    </div>
  );
}
