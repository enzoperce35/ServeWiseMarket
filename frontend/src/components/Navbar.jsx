import React from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import brandLogo from "../assets/images/brand-logo.png";
import "../css/components/Navbar.css";

// Import the Heroicons shopping bag (basket) icon
import { ShoppingCartIcon } from "@heroicons/react/24/outline";


export default function Navbar() {
  const { user, handleLogout } = useAuthContext();

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
                SignUp
              </Link>
            </>
          ) : (
            <>
              {user.shop ? (
                <Link to="/seller/products" className="nav-btn nav-btn-primary">
                  Shop
                </Link>
              ) : (
                <Link to="/seller/create-shop" className="nav-btn nav-btn-primary">
                  Sell?
                </Link>
              )}
              <button
                className="nav-btn nav-btn-outline"
                onClick={() => handleLogout()}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom row only on small devices */}
      {user && (
        <div className="navbar-bottom mobile-only">
          <span className="navbar-user">Hi, {user.name} 👋</span>
          <button className="cart-btn">
            <ShoppingCartIcon className="icon" />
          </button>
        </div>
      )}
    </nav>
  );
}
