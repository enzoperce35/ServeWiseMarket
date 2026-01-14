import React from "react";
import { Link, useNavigate } from "react-router-dom";
import InitialsLogo from "../../utils/InitialsLogo";
import GlobalCartOrders from "../common/GlobalCartOrders";
import "../../css/components/Navbar/PublicNavbar.css";

export default function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="buyer-navbar">
      <div className="buyer-navbar-top">
        {/* ---------- Logo ---------- */}
        <div className="buyer-navbar-logo">
          <Link to="/">
            <InitialsLogo name="YourApp" size={60} />
          </Link>
        </div>

        {/* ---------- Cart ---------- */}
        <div className="buyer-navbar-icons">
          <GlobalCartOrders
            wrapperClass="navbar-icons-wrapper"
            buttonClass="navbar-icon-btn"
            iconClass="navbar-icon"
            badgeClass="navbar-badge"
          />
        </div>
      </div>
    </nav>
  );
}
