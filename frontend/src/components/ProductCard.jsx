import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider";
import { addToCartApi } from "../api/cart";
import { isOwner } from "../utils/userProducts";
import toast from "react-hot-toast";
import "../css/components/ProductCard.css";

export default function ProductCard({ product, clickable = true }) {
  const { user, token } = useAuthContext();
  const { refreshCart } = useCartContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCardClick = () => {
    if (clickable) navigate(`/product/${product.id}`);
  };

  const addToCart = async (e, quantity = 1) => {
    e.stopPropagation();
    if (!user || !token) {
      toast.error("Please log in to add items to tray");
      return;
    }
    if (loading) return;

    try {
      setLoading(true);
      await addToCartApi(product.id, quantity, token);
      await refreshCart();

      toast.success(
        (t) => (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span>Added to tray</span>
          </div>
        ),
        { duration: 2000 }
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const getPriceString = (product) => {
    const basePrice = parseFloat(product.price ?? 0);
    return `₱${basePrice.toFixed(2)}`;
  };

  return (
    <div
      className={`product-card ${product.status ? "" : "inactive"} ${
        product.preorder_delivery ? "preorder" : "regular"
      }`}
      onClick={handleCardClick}
      style={{ cursor: clickable ? "pointer" : "default" }}
    >
      <img
        src={product.image_url || "/images/default-product.png"}
        alt={product.name}
      />

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
      </div>

      {/* Show price instead of inactive label */}
      <p className="product-price-label">{getPriceString(product)}</p>

      {!isOwner(user, product) && (
        <button
          className="add-to-cart"
          onClick={(e) => addToCart(e, 1)}
          disabled={loading}
          style={{
            opacity: loading ? 0.6 : 1,
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          {loading ? "Adding..." : "Add to Tray"}
        </button>
      )}
    </div>
  );
}
