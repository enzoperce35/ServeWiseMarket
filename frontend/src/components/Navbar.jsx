import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider";
import { useOrdersContext } from "../context/OrdersProvider";
import brandLogo from "../assets/images/brand-logo.png";
import GlobalCartOrders from "./common/GlobalCartOrders";
import "../css/components/Navbar.css";

export default function Navbar() {
  const { user, handleLogout } = useAuthContext();
  const { cart, refreshCart } = useCartContext();
  const { ordersCount, refreshOrders } = useOrdersContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    refreshCart();
    refreshOrders();
  }, []);

  return (
    <nav className="navbar">
      {/* Top row: Logo + Auth/Shop Buttons */}
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
                <Link
                  to="/seller/create-shop"
                  className="nav-btn nav-btn-primary"
                >
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

      {/* Desktop: Greeting left + GlobalCartOrders right */}
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
