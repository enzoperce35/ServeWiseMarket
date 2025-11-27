import React from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider"; // useAuthContext here
import brandLogo from "../assets/images/brand-logo.png";
import "../css/components/Navbar.css";

export default function Navbar() {
  const { user, handleLogout } = useAuthContext();

  return (
    <nav className="navbar">
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
              SignUp
            </Link>
          </>
        ) : (
          <>
            <span className="navbar-user">Hi, {user.name} 👋</span>
            {user.shop ? (
              <Link to="/seller/products" className="nav-btn nav-btn-primary">
                Seller Dashboard
              </Link>
            ) : (
              <Link to="/seller/create-shop" className="nav-btn nav-btn-primary">
                Create Shop
              </Link>
            )}
            <button
              className="nav-btn nav-btn-outline"
              onClick={() => handleLogout()}
            >
              Logout
            </button>
            <button className="cart-btn">🛒</button>
          </>
        )}
      </div>
    </nav>
  );
}
