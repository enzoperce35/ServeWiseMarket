import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider"; // ✅ import cart context
import brandLogo from "../assets/images/brand-logo.png";
import "../css/components/Navbar.css";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, handleLogout } = useAuthContext();
  const { cart } = useCartContext(); // ✅ get cart state
  const navigate = useNavigate();

  const itemCount = cart ? cart.item_count : 0; // total items in cart

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
                <Link
                  to="/seller/products"
                  className={`nav-btn nav-btn-primary ${user.shop.open ? "" : "shop-closed"}`}
                >
                  Shop
                </Link>
              ) : (
                <Link to="/seller/create-shop" className="nav-btn nav-btn-primary">
                  Sell?
                </Link>
              )}
              <button className="nav-btn nav-btn-outline" onClick={() => handleLogout(navigate)}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom row for mobile / cart */}
      {user && (
        <div className="navbar-bottom mobile-only">
          <span className="navbar-user">Hi, {user.name} 👋</span>
          <button
            className="cart-btn"
            onClick={() => navigate("/cart")} // ✅ navigate to cart page
          >
            <ShoppingCartIcon className="icon" />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>} {/* live count */}
          </button>
        </div>
      )}
    </nav>
  );
}
