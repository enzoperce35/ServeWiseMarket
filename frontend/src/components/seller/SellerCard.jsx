import React, { useState, useEffect } from "react";
import "../../css/components/seller/SellerCard.css";

export default function SellerCard({ product, user, onClick, onStatusClick }) {
  const [status, setStatus] = useState(Boolean(product.status));

  const price = Number(product.price || 0);
  const imageUrl = product.image_url || "/images/default-product.png";
  const stock = product.stock ?? 0;
  const nextAvailable = product.next_available_date || "N/A";

  useEffect(() => {
    setStatus(Boolean(product.status));
  }, [product.status]);

  /* =========================================================
     📦 DELIVERY FORMATTER (FINAL FULL BUILD)
     ========================================================= */
  const getDeliveryLabel = () => {
    // 1. preorder_delivery is OFF → auto 30 mins
    if (!product.preorder_delivery) return "in 30 minutes";

    const dDate = product.delivery_date ? new Date(product.delivery_date) : null;
    const dTime = product.delivery_time ? new Date(product.delivery_time) : null;
    if (!dDate) return "Schedule not set";

    // 🕓 detect expired past day
    const today = new Date().setHours(0, 0, 0, 0);
    const delDay = new Date(dDate).setHours(0, 0, 0, 0);
    if (delDay < today) return "Unavailable";

    // 🧾 Day Text: Today | Tomorrow | Nov 30
    const diffDays = (delDay - today) / (1000 * 60 * 60 * 24);
    let dayLabel =
      diffDays === 0
        ? "Today"
        : diffDays === 1
        ? "Tomorrow"
        : dDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

    // 🕒 If no time or midnight → Day Only
    if (!product.delivery_time || dTime.getHours() === 0) {
      return dayLabel;
    }

    // 🕒 With Time → 30-minute delivery span
    const hour = dTime.getHours();
    const minute = dTime.getMinutes();
    const endMins = (minute + 30) % 60;

    const formatTime = (h, m) => {
      const ampm = h >= 12 ? "pm" : "am";
      const stdH = (h % 12 || 12);
      const stdM = m > 0 ? `:${m.toString().padStart(2, "0")}` : "";
      return `${stdH}${stdM}${ampm}`;
    };

    const first = formatTime(hour, minute);
    const second = formatTime(hour, endMins);

    // Example outputs:
    // Today 9am-9:30am
    // Tomorrow 5pm-5:30pm
    // Dec. 1 8pm-8:30pm
    return `${dayLabel} ${first}-${second}`;
  };

  const deliveryLabel = getDeliveryLabel();

  /* ========================================================= */
  const getStatusColor = () => {
    if (!status) return "#ccc"; 
    if (status && product.preorder_delivery) return "orange";
    return "green";
  };

  const handleStatusClick = (e) => {
    e.stopPropagation();
    const newStatus = !status;
    setStatus(newStatus);
    onStatusClick?.({ ...product, status: newStatus });
  };

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

      <div className="seller-product-name">
        <h3>{product.name}</h3>

        {/* Price + Stock */}
        <div className="price-stock-container">
          <p className="price-stock"><strong>Price:</strong> ₱{price.toFixed(2)}</p>
          <p className="price-stock"><strong>Stock:</strong> {stock}</p>
        </div>

        {/* Pre-order Availability Date */}
        {product.availability_type === "pre_order" && (
          <p><strong>Next Available:</strong> {nextAvailable}</p>
        )}

        {/* 📌 Delivery label updated */}
        <div className="bottom-row">
          <p className="delivery-label">
            <span>Deliver:</span><br />
            <span className="delivery-date">{deliveryLabel}</span>
          </p>

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
