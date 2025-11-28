import React from "react";
import { useAuthContext } from "../context/AuthProvider";
import "../css/components/ProductCard.css";

export default function ProductCard({ product }) {
  const { user } = useAuthContext();

  const addToCart = () => {
    if (!user) {
      alert("Please log in to add items to cart.");
      return;
    }
    alert(`Added ${product.name} to cart!`);
  };

  const now = new Date();
  const todayString = now.toDateString();
  const rawDate = product.delivery_date ? new Date(product.delivery_date) : null;
  const rawTime = product.delivery_time ? new Date(product.delivery_time) : null;

  let formattedDate = "";
  let formattedTime = "";

  // 🟡  TIME — clean formatting
  if (rawTime) {
    formattedTime = rawTime
      .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      .replace(":00", "") // 3:00PM -> 3PM
      .replace(" ", "");  // 3 PM -> 3PM
  }

  // 🟡 DATE Logic
  if (!rawDate && !rawTime) {
    formattedDate = "In 30 minutes"; // null date + null time
  } else if (rawDate && rawDate.toDateString() === todayString && !rawTime) {
    formattedDate = "In 30 minutes"; // today but no time
  } else if (rawDate) {
    // Tomorrow check
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (rawDate.toDateString() === tomorrow.toDateString()) {
      formattedDate = "Tomorrow";
    } else if (rawDate.toDateString() !== todayString) {
      formattedDate = rawDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }

  // 🔥 Final Output Formatting
  const deliveryDisplay =
    formattedDate && formattedTime
      ? `${formattedDate}, ${formattedTime}`
      : formattedDate || formattedTime;

  return (
    <div className={`product-card ${product.status ? "" : "inactive"}`} onClick={addToCart}>
      <img src={product.image_url || "/images/default-product.png"} alt={product.name} />

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {deliveryDisplay && (
          <p className="delivery">
            Delivery: <span className="delivery-time">{deliveryDisplay}</span>
          </p>
        )}

        <p className="product-price">₱{product.price}</p>
      </div>

      {!product.status && <p className="inactive-label">Inactive</p>}
    </div>
  );
}
