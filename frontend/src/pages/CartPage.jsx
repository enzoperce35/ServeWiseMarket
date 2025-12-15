import React from "react";
import { useCartContext } from "../context/CartProvider";
import { useAuthContext } from "../context/AuthProvider"; // ✅ import token
import { removeFromCartApi } from "../api/cart";
import "../css/pages/CartPage.css"

export default function CartPage() {
  const { cart, fetchCart } = useCartContext();
  const { token } = useAuthContext(); // ✅ get token

  if (!cart || cart.shops.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  const handleRemoveItem = async (cartItemId) => {
    if (!token) {
      alert("You must be logged in to remove items from the cart.");
      return;
    }

    try {
      await removeFromCartApi(cartItemId, token); // ✅ pass token
      await fetchCart(); // Refresh cart
    } catch (err) {
      alert(`Remove failed: ${err.message}`);
    }
  };

  // Calculate grand total safely
  const grandTotal = cart.shops.reduce((acc, shop) => {
    const shopTotal = shop.items.reduce(
      (sum, item) => sum + Number(item.total_price || 0),
      0
    );
    return acc + shopTotal;
  }, 0);

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {cart.shops.map((shop) => (
        <div key={shop.shop_id} className="cart-shop">
          <h3>{shop.shop_name}</h3>
          {shop.items.map((item) => (
            <div key={item.cart_item_id} className="cart-item">
              <img
                src={item.image_url || "/images/default-product.png"}
                alt={item.name}
                className="cart-item-img"
              />
              <div className="cart-item-info">
                <span className="cart-item-name">{item.name}</span>
                <span className="cart-item-qty">Qty: {item.quantity}</span>
                <span className="cart-item-price">
                  ₱{Number(item.total_price || 0).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => handleRemoveItem(item.cart_item_id)}
                className="cart-item-remove"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="cart-shop-subtotal">
            Subtotal: ₱
            {shop.items
              .reduce((sum, item) => sum + Number(item.total_price || 0), 0)
              .toFixed(2)}
          </div>
        </div>
      ))}

    <div className="cart-grand-total">
        Grand Total: ₱{grandTotal.toFixed(2)}
      </div>
    </div>
  );
}
