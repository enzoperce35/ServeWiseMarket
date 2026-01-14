// components/BuyerNavbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import GlobalCartOrders from "../common/GlobalCartOrders";
import brandLogo from "../../assets/images/brand-logo.png";

export default function BuyerNavbar() {
  const { user, handleLogout } = useAuthContext();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-logo">
          <Link to="/">
            <img src={brandLogo} className="navbar-logo-img" alt="logo" />
          </Link>
        </div>

        <div className="navbar-right">
          {!user ? (
            <>
              <Link to="/login" className="nav-btn">
                Login
              </Link>
              <Link to="/signup" className="nav-btn nav-btn-primary">
                Sign Up
              </Link>
            </>
          ) : (
            <button
              className="nav-btn nav-btn-outline"
              onClick={() => handleLogout(navigate)}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {user && (
        <div className="navbar-bottom">
          <span className="navbar-user">Hi, {user.name} 👋</span>

          <GlobalCartOrders
            wrapperClass="navbar-icons-wrapper"
            buttonClass="navbar-icon-btn"
            iconClass="navbar-icon"
            badgeClass="navbar-badge"
          />
        </div>
      )}
    </nav>
  );
}
