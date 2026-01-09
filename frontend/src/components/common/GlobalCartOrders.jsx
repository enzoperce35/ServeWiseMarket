import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../context/CartProvider";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import "../../css/components/common/GlobalCartOrders.css";

export default function GlobalCartOrders({ className = "", style = {} }) {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCartContext();

  const [animateCart, setAnimateCart] = React.useState(false);
  const prevCartRef = useRef(cart?.item_count || 0);
 
  // Refresh counts on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Animate cart
  useEffect(() => {
    if ((cart?.item_count || 0) > prevCartRef.current) {
      setAnimateCart(true);
      const t = setTimeout(() => setAnimateCart(false), 350);
      return () => clearTimeout(t);
    }
    prevCartRef.current = cart?.item_count || 0;
  }, [cart?.item_count]);


  return (
    <div className={`global-cart-orders-wrapper ${className}`} style={style}>
      {/* CART */}
      <button
        className={`global-cart-orders-btn ${animateCart ? "cart-badge-animate" : ""}`}
        onClick={() => navigate("/cart")}
      >
        <ShoppingCartIcon className="global-cart-orders-icon" />
        {cart?.item_count > 0 && (
          <span className="global-cart-orders-count">{cart.item_count}</span>
        )}
      </button>
    </div>
  );
}
