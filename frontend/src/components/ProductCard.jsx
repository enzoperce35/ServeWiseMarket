import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider";
import { addToCartApi } from "../api/cart";
import { getDeliveryLabel } from "../utils/deliveryDateTime";
import { isOwner, getPriceString } from "../utils/userProducts";
import "../css/components/ProductCard.css";

export default function ProductCard({ product, clickable = true }) {
  const { user, token } = useAuthContext();
  const { refreshCart } = useCartContext();
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (clickable) navigate(`/product/${product.id}`);
  };

  const addToCart = async (e, quantity = 1) => {
    e.stopPropagation();
    if (!user || !token) {
      alert("Please log in to add items to cart.");
      return;
    }

    try {
      await addToCartApi(product.id, quantity, token); // ✅ token is third argument
      alert(`${product.name} added to tray`);
      refreshCart();
    } catch (err) {
      alert(err.message);
    }
  };

  const deliveryDisplay = getDeliveryLabel(product);
  const priceString = getPriceString(product, user);

  return (
    <div
      className={`product-card ${product.status ? "" : "inactive"} ${
        product.preorder_delivery ? "preorder" : "regular"
      }`}
      onClick={handleCardClick}
      style={{ cursor: clickable ? "pointer" : "default" }}
    >
      <img src={product.image_url || "/images/default-product.png"} alt={product.name} />

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {deliveryDisplay && (
          <p className="delivery">
            Delivery: <span className="delivery-time">{deliveryDisplay}</span>
          </p>
        )}
        <p className="product-price">{priceString}</p>
      </div>

      {!isOwner(user, product) && (
        <button className="add-to-cart" onClick={(e) => addToCart(e, 1)}>
          Add to Tray
        </button>
      )}

      {!product.status && <p className="inactive-label">Inactive</p>}
    </div>
  );
}
