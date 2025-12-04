import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import { HomeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import "../../css/seller/navbar.css";

export default function SellerNavbar() {
  const navigate = useNavigate();
  const { user, updateUserShop } = useAuthContext();

  const shopName = user?.shop?.name || "My Shop";

  const now = new Date();
  const today = now.toDateString();
  const hour = now.getHours();
  const isWithinToggleHours = hour >= 6 && hour < 20;

  // Check if first click already done today
  const firstClickDoneToday = localStorage.getItem("firstClickDate") === today;

  // Initialize shopOpen state
  const [shopOpen, setShopOpen] = useState(() => {
    // After 6AM, default CLOSED until first click
    if (hour >= 6 && !firstClickDoneToday) return false;
    return user?.shop?.open ?? false;
  });

  const handleToggle = () => {
    if (!isWithinToggleHours) return;

    let newState;

    // First click after 6AM → force OPEN
    if (!firstClickDoneToday && hour >= 6 && !shopOpen) {
      newState = true;
      localStorage.setItem("firstClickDate", today);
    } else {
      newState = !shopOpen;
    }

    setShopOpen(newState);
    updateUserShop({ open: newState });
  };

  return (
    <nav className="seller-navbar">
      <div className="nav-main-row">
        <div className="nav-left" onClick={() => navigate("/")}>
          <HomeIcon className="nav-icon" />
        </div>

        <div className="nav-center" style={{ cursor: "pointer" }}>
          <h2 onClick={() => navigate("/seller/shop")}>{shopName}</h2>
        </div>

        <div className="nav-right" onClick={() => navigate("/seller/orders")}>
          <ShoppingBagIcon className="nav-icon" />
        </div>
      </div>

      {isWithinToggleHours && (
        <div className="nav-status-row">
          <div
            className={`status-pill ${shopOpen ? "open" : "closed"}`}
            onClick={handleToggle}
          >
            {shopOpen ? "OPEN 🟢" : "CLOSED 🔴"}
          </div>
        </div>
      )}
    </nav>
  );
}
