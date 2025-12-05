// src/pages/seller/ShopPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "../../css/components/seller/ShopPage.css";

export default function ShopPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadShop = async () => {
      try {
        const res = await axiosClient.get(`/shops/${shopId}`);
        if (!res.data?.shop) {
          setErrorMessage("Shop not found");
          return;
        }
        setShop(res.data.shop);
      } catch (err) {
        console.error("Failed to load shop:", err);
        setErrorMessage("Shop not found");
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

  if (loading) return <p className="user-shop-page-loading">Loading shop...</p>;
  if (errorMessage) return <p className="user-shop-page-not-found">{errorMessage}</p>;

  const formatAddress = (user) => {
    if (!user) return "N/A";
    const { block, lot, street, phase, community } = user;
    return [block, lot, street, phase, community].filter(Boolean).join(", ");
  };

  return (
    <div className="user-shop-page">
      {/* Back Button */}
      <button
        className="user-shop-page-back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Shop Header */}
      <div className="user-shop-page-header">
        <h1 className="user-shop-page-title">{shop.name}</h1>
        {shop.description && (
          <p className="user-shop-page-description">{shop.description}</p>
        )}
        <p
          className={`user-shop-page-status ${
            shop.open ? "open" : "closed"
          }`}
        >
          {shop.open ? "Open" : "Closed"}
        </p>
      </div>

      {/* Shop Info */}
      <div className="user-shop-page-info">
        <p><strong>Owner:</strong> {shop.user?.name || "N/A"}</p>
        <p><strong>Address:</strong> {formatAddress(shop.user)}</p>
        <p><strong>Contact:</strong> {shop.user?.contact_number || "N/A"}</p>
      </div>

      {/* Products */}
      {shop.products?.length > 0 ? (
        <div className="user-shop-page-products">
          <h2 className="user-shop-page-products-header">Products</h2>
          <div className="user-shop-page-products-grid">
            {shop.products.map((p) => (
              <div
                key={p.id}
                className="user-shop-page-product-card"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="user-shop-page-product-image"
                  />
                ) : (
                  <div className="user-shop-page-product-placeholder">
                    <span>{shop.name}</span>
                  </div>
                )}
                <h3 className="user-shop-page-product-name">{p.name}</h3>
                <p className="user-shop-page-product-price">
                  ₱{Number(p.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="user-shop-page-no-products">No products listed yet.</p>
      )}
    </div>
  );
}
