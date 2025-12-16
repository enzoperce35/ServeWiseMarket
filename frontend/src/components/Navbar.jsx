import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider";
import brandLogo from "../assets/images/brand-logo.png";
import "../css/components/Navbar.css";
import {
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, handleLogout } = useAuthContext();
  const { cart } = useCartContext();
  const navigate = useNavigate();

  const itemCount = cart?.item_count || 0;
  const ongoingOrdersCount = user?.ongoing_orders_count || 0;

  return (
    <nav className="navbar">
      {/* Top row: logo + auth/shop buttons */}
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
                  className={`nav-btn nav-btn-primary ${
                    user.shop.open ? "" : "shop-closed"
                  }`}
                >
                  Shop
                </Link>
              ) : (
                <Link to="/seller/create-shop" className="nav-btn nav-btn-primary">
                  Sell?
                </Link>
              )}

              <button
                className="nav-btn nav-btn-outline"
                onClick={() => handleLogout(navigate)}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom row: greetings + icons (responsive for all devices) */}
      {user && (
        <div className="navbar-bottom">
          <span className="navbar-user">Hi, {user.name} 👋</span>
          <div className="nav-icons">
            {/* Orders icon */}
            {ongoingOrdersCount > 0 && (
              <button
                className="orders-btn"
                onClick={() => navigate("/orders")}
              >
                <ClipboardDocumentListIcon className="icon" />
                <span className="orders-badge">{ongoingOrdersCount}</span>
              </button>
            )}

            {/* Cart icon */}
            <button className="cart-btn" onClick={() => navigate("/cart")}>
              <ShoppingCartIcon className="icon" />
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
