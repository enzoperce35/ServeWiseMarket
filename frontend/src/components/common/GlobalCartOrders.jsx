import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../context/CartProvider";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import "../../css/components/common/GlobalCartOrders.css";

export default function GlobalCartOrders({ className = "", style = {} }) {
  const navigate = useNavigate();
  const { cart, refreshCart, activeShopId } = useCartContext();

  const [animateCart, setAnimateCart] = useState(false);

  // 🔹 Get only active shop
  const activeShop = activeShopId
    ? cart?.shops?.find((shop) => shop.shop_id === activeShopId)
    : null;

  const activeShopItemCount =
    activeShop?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  const prevCountRef = useRef(activeShopItemCount);

  // Refresh cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Animate badge only when active shop count increases
  useEffect(() => {
    if (activeShopItemCount > prevCountRef.current) {
      setAnimateCart(true);
      const t = setTimeout(() => setAnimateCart(false), 350);
      return () => clearTimeout(t);
    }
    prevCountRef.current = activeShopItemCount;
  }, [activeShopItemCount]);


  return (
    <div className={`global-cart-orders-wrapper ${className}`} style={style}>
      <button
        className={`global-cart-orders-btn ${animateCart ? "cart-badge-animate" : ""}`}
        onClick={() => navigate("/cart")}
      >
        <ShoppingCartIcon className="global-cart-orders-icon" />

        {activeShopItemCount > 0 && (
          <span className="global-cart-orders-count">{activeShopItemCount}</span>
        )}
      </button>
    </div>
  );
}
