// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import "../css/components/Navbar.css";

export default function Navbar() {
  const { user, handleLogout } = useAuthContext();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-logo">
          <Link to="/">ServeWise Market</Link>
        </h2>
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
          <>
            <span className="navbar-user">Hi, {user.name} 👋</span>
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
