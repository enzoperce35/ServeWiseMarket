import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import { HomeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import "../../css/seller/navbar.css";

export default function SellerNavbar() {
  const navigate = useNavigate();
  const { user, updateUserShop } = useAuthContext();

  const shopName = user?.shop?.name || "My Shop";

  // UI state for shop open/closed
  const [shopOpen, setShopOpen] = useState(user?.shop?.open ?? false);

  // Track first toggle today
  const [hasFirstToggleToday, setHasFirstToggleToday] = useState(() => {
    const saved = localStorage.getItem("firstToggleDate");
    const today = new Date().toDateString();
    return saved === today;
  });

  // Only update shopOpen from user on mount
  useEffect(() => {
    setShopOpen(user?.shop?.open ?? false);
  }, []); // empty deps to avoid resetting on every user update

  const markFirstToggleToday = () => {
    const today = new Date().toDateString();
    localStorage.setItem("firstToggleDate", today);
    setHasFirstToggleToday(true);
  };

  const hour = new Date().getHours();
  const isWithinToggleHours = hour >= 6 && hour < 20;

  const handleToggle = () => {
    if (!isWithinToggleHours) return;

    let newState = shopOpen;

    // First toggle after 6AM always sets open = true
    if (!hasFirstToggleToday && hour >= 6) {
      newState = true;
      markFirstToggleToday();
    } else {
      newState = !shopOpen;
    }

    setShopOpen(newState);

    // Update backend
    updateUserShop({ open: newState });
  };

  return (
    <nav className="seller-navbar">
      {/* Top row: Home, ShopName, Orders */}
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

      {/* Bottom row: OPEN / CLOSED toggle/status */}
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
