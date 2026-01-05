import React from "react";
import "../../css/components/seller/SellerCard.css";

export default function SellerCard({ product, onClick, onStatusClick, deliveryHour }) {
  const price = Number(product.price || 0);
  const stock = product.stock ?? 0;
  const imageUrl = product.image_url || "/images/default-product.png";

  // Check if this product has the current hour in its delivery_times
  const hasDeliveryTime = (product.delivery_times || []).some(
    (slot) => slot.hour === deliveryHour
  );

  const getStatusColor = () => {
    return hasDeliveryTime ? "green" : "#ccc";
  };

  const handleStatusClick = (e) => {
    e.stopPropagation();

    // If green, remove this hour; if grey, add this hour
    let updatedDeliveryTimes;
    if (hasDeliveryTime) {
      updatedDeliveryTimes = (product.delivery_times || []).filter(
        (slot) => slot.hour !== deliveryHour
      );
    } else {
      updatedDeliveryTimes = [
        ...(product.delivery_times || []),
        { hour: deliveryHour },
      ];
    }

    onStatusClick?.({ ...product, delivery_times: updatedDeliveryTimes });
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

        {/* Status dot */}
        <span className="status-dot-wrapper" onClick={handleStatusClick}>
          <span
            className="status-dot"
            style={{ backgroundColor: getStatusColor() }}
            title={hasDeliveryTime ? "Scheduled" : "Not Scheduled"}
          />
        </span>
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
