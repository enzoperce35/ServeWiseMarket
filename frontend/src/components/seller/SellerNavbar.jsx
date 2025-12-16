import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import { HomeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import "../../css/seller/navbar.css";

export default function SellerNavbar() {
  const navigate = useNavigate();
  const { user, updateShop } = useAuthContext(); // ✅ use correct function name

  const shopName = user?.shop?.name || "My Shop";

  const now = new Date();
  const hour = now.getHours();
  const isWithinToggleHours = hour >= 6 && hour < 20;

  const [shopOpen, setShopOpen] = useState(user?.shop?.open ?? false);

  // Keep local state in sync with user context
  useEffect(() => {
    setShopOpen(user?.shop?.open ?? false);
  }, [user?.shop?.open]);

  const handleToggle = async () => {
    if (!isWithinToggleHours) return;

    const newState = !shopOpen;
    setShopOpen(newState);

    try {
      // Backend handles user_opened_at automatically
      await updateShop({ open: newState }); // ✅ updated function call
    } catch (err) {
      console.error("Failed to update shop:", err);
    }
  };

  if (!user || !user.shop) return null; // null-safe

  return (
    <nav className="seller-navbar">
      <div className="nav-main-row">
        <div className="nav-left" onClick={() => navigate("/")}>
          <HomeIcon className="nav-icon" />
        </div>

        <div className="nav-center" style={{ cursor: "pointer" }}>
          <h2
            onClick={() => {
              if (user?.shop?.id) {
                navigate(`/shop/${user.shop.id}`);
              } else {
                alert("You don't have a shop yet.");
              }
            }}
          >
            {shopName}
          </h2>
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
