import React, { useState, useEffect } from "react";
import "../../css/components/seller/ProductCard.css";

export default function ProductCard({ product, user, onClick, onStatusClick }) {
  const [status, setStatus] = useState(Boolean(product.status));

  const price = Number(product.price || 0);
  const imageUrl = product.image_url || "/images/default-product.png";
  const stock = product.stock ?? 0;
  const nextAvailable = product.next_available_date || "N/A";

  useEffect(() => {
    setStatus(Boolean(product.status));
  }, [product.status]);

  // ---- DELIVERY FORMATTER ----
  const formatDelivery = (product) => {
    const { delivery_date, delivery_time } = product;
    if (!delivery_date && !delivery_time) return "Deliver: Any Time";

    let dateLabel = "";
    if (delivery_date) {
      const d = new Date(delivery_date);
      dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    let timeLabel = "";
    if (delivery_time) {
      const dt = new Date(delivery_time);
      const hour = dt.getHours();
      const startAmpm = hour >= 12 ? "pm" : "am";
      const startHour = hour % 12 === 0 ? 12 : hour % 12;
      const endHour24 = (hour + 1) % 24;
      const endAmpm = endHour24 >= 12 ? "pm" : "am";
      const endHour = endHour24 % 12 === 0 ? 12 : endHour24 % 12;
      timeLabel = `${startHour}${startAmpm} - ${endHour}${endAmpm}`;
    }

    if (dateLabel && timeLabel) return `Deliver: ${dateLabel}, ${timeLabel}`;
    if (dateLabel) return `Deliver: ${dateLabel}`;
    return `Deliver: ${timeLabel}`;
  };

  const deliveryLabel = formatDelivery(product);

  // ---- STATUS COLOR ----
  const getStatusColor = () => {
    if (!status) return "#ccc";
    if (status && (product.delivery_date || product.delivery_time)) return "orange";
    return "green";
  };

  // ---- STATUS TOGGLE ----
  const handleStatusClick = (e) => {
    e.stopPropagation();
    const newStatus = !status;
    setStatus(newStatus);
    onStatusClick?.({ ...product, status: newStatus });
  };

  // ---- COMMUNITY CHECKS ----
  const shortenCommunity = (community) => {
    if (community === "Sampaguita Homes") return "Homes";
    if (community === "Sampaguita West") return "West";
    return community || "Unknown";
  };

  const userCommunity = shortenCommunity(user?.community);
  const otherCommunity = userCommunity === "Homes" ? "West" : "Homes";

  const getCheckIcon = (community) => {
    if (!user?.community) return "❌";
    if (product.cross_comm_delivery) return "✅";
    return community === userCommunity ? "✅" : "❌";
  };

  return (
    <div className="seller-product-card clickable-card" onClick={onClick}>
      <div className="seller-product-img-wrapper">
        <img src={imageUrl} alt={product.name} className="seller-product-img" />
        <span className="status-dot-wrapper" onClick={handleStatusClick}>
          <span
            className="status-dot"
            style={{ backgroundColor: getStatusColor() }}
            title={`Status: ${
              !status
                ? "Inactive"
                : product.delivery_date || product.delivery_time
                ? "Scheduled"
                : "Active"
            }`}
          />
        </span>
      </div>

      <div className="seller-product-info">
        <h3>{product.name}</h3>

        <p className="price-stock">
          <strong>Price:</strong> ₱{price.toFixed(2)} &nbsp; | &nbsp;
          <strong>Stock:</strong> {stock}
        </p>

        {product.availability_type === "pre_order" && (
          <p><strong>Next Available:</strong> {nextAvailable}</p>
        )}

        {/* Bottom row: delivery left, community right */}
        <div className="bottom-row">
          <p className="delivery-label">{deliveryLabel}</p>

          {user?.community && (
            <div className="community-checks">
              <span>{userCommunity} {getCheckIcon(userCommunity)}</span>
              <span>{otherCommunity} {getCheckIcon(otherCommunity)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
