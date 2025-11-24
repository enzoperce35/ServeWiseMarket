import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import { HomeIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import "../../css/seller/navbar.css";

export default function SellerNavbar() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const shopName = user?.shop?.name || "My Shop";

  return (
    <nav className="seller-navbar">
      {/* Left: Home Icon */}
      <div className="nav-left" onClick={() => navigate("/")}>
        <HomeIcon className="nav-icon" />
      </div>

      {/* Center: Shop Name */}
      <div className="nav-center" onClick={() => navigate("/seller/shop")} style={{ cursor: "pointer" }}>
        <h2>{shopName}</h2>
      </div>

      {/* Right: Orders Icon */}
      <div className="nav-right" onClick={() => navigate("/seller/orders")}>
        <ShoppingBagIcon className="nav-icon" />
      </div>
    </nav>
  );
}
