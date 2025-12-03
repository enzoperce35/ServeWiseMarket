import React, { useState, useEffect } from "react";
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

  const isAfter6AM = hour >= 6; // can toggle after 6AM
  const isWithinToggleHours = hour >= 6 && hour < 20;

  // Detect if today's forced-close was already done
  const forcedClosedAlready = localStorage.getItem("forcedClosedDate") === today;

  // Detect if first toggle today was already done
  const firstToggleAlready = localStorage.getItem("firstToggleDate") === today;

  // UI shop open state
  const [shopOpen, setShopOpen] = useState(() => {
    // After 6AM → force CLOSED ONCE per day
    if (isAfter6AM && !forcedClosedAlready) {
      return false;
    }
    return user?.shop?.open ?? false;
  });

  // Save today's forced-close so it doesn't happen again this day
  useEffect(() => {
    if (isAfter6AM && !forcedClosedAlready) {
      localStorage.setItem("forcedClosedDate", today);
    }
  }, []);

  // State for first toggle
  const [hasFirstToggleToday, setHasFirstToggleToday] = useState(firstToggleAlready);

  const handleToggle = () => {
    if (!isWithinToggleHours) return;

    let newState;

    // FIRST toggle of the day after 6AM → FORCE OPEN
    if (!hasFirstToggleToday && isAfter6AM) {
      newState = true;
      localStorage.setItem("firstToggleDate", today);
      setHasFirstToggleToday(true);
    } else {
      // Subsequent toggles → normal toggle
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
