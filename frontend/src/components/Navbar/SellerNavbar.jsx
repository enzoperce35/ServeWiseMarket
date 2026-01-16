// components/SellerNavbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import InitialsLogo from "../../utils/InitialsLogo";
import "../../css/components/Navbar/SellerNavbar.css";

export default function SellerNavbar() {
  const { user, handleLogout } = useAuthContext();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const shop = user?.shop;

  // Copy shop link when logo is clicked
  const handleCopyShopLink = () => {
    if (!shop) return;

    const shopLink = `${window.location.origin}/products?shop_id=${shop.id}`;
    navigator.clipboard.writeText(shopLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <nav className="seller-navbar">
      <div className="seller-navbar-top">

        {/* ---------- LEFT: LOGO + GREETING ---------- */}
        <div className="seller-navbar-left">
          {shop?.name ? (
            <div
              className="seller-navbar-logo"
              onClick={handleCopyShopLink}
              style={{ cursor: "pointer" }}
              title="Click to copy shop link"
            >
              <InitialsLogo name={shop.name} size={60} />
            </div>
          ) : (
            <div className="seller-navbar-logo-hidden"></div>
          )}

          {user && (
            <span className="seller-navbar-user">
              Hi, {user.name} 👋
            </span>
          )}
        </div>

        {/* ---------- RIGHT: ACTION BUTTONS ---------- */}
        <div className="seller-navbar-right">
          {!user ? (
            <>
              <Link to="/login" className="seller-nav-btn">
                Login
              </Link>

              <Link
                to="/signup"
                className="seller-nav-btn seller-nav-btn-primary"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* ---------- ONLY SHOW SHOP BUTTONS FOR SELLERS ---------- */}
              {user.role === "seller" && (
                shop ? (
                  <Link
                    to="/seller/products"
                    className={`seller-nav-btn seller-nav-btn-primary ${shop.open ? "" : "seller-shop-closed"
                      }`}
                  >
                    Shop
                  </Link>
                ) : (
                  <Link
                    to="/seller/create-shop"
                    className="seller-nav-btn seller-nav-btn-primary"
                  >
                    Sell?
                  </Link>
                )
              )}

              <button
                className="seller-nav-btn seller-nav-btn-outline"
                onClick={() => handleLogout(navigate)}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Optional: show temporary copied status */}
      {copied && <div className="copy-feedback">Shop link copied!</div>}
    </nav>
  );
}
