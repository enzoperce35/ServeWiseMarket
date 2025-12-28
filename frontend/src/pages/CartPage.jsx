import React from "react";
import { useCartContext } from "../context/CartProvider";
import { useAuthContext } from "../context/AuthProvider";
import { removeFromCartApi } from "../api/cart";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/common/BackButton";
import toast from "react-hot-toast";
import { checkoutApi } from "../api/orders";
import "../css/pages/CartPage.css";

export default function CartPage() {
  const { cart, fetchCart } = useCartContext();
  const { token } = useAuthContext();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!token) {
      toast.error("Please log in to checkout");
      return;
    }

    try {
      await checkoutApi(token);
      await fetchCart();
      toast.success("Order placed successfully 🎉");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.error || "Checkout failed");
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!token) {
      alert("You must be logged in to remove items from the cart.");
      return;
    }

    try {
      await removeFromCartApi(cartItemId, token);
      await fetchCart();
    } catch (err) {
      alert(`Remove failed: ${err.message}`);
    }
  };

  // Calculate grand total safely
  const grandTotal = cart?.shops?.reduce((acc, shop) => {
    const shopTotal = shop.items.reduce(
      (sum, item) => sum + Number(item.total_price || 0),
      0
    );
    return acc + shopTotal;
  }, 0) || 0;

  return (
    <div className="cart-page">
      {/* ===== BACK BUTTON ===== */}
      <div className="cart-header">
        <BackButton
          className="cart-back-btn"
          fallback="/"
        />
      </div>

      {(!cart || cart.shops.length === 0) && (
        <p className="cart-empty">Your cart is empty.</p>
      )}

      {cart?.shops?.map((shop) => (
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

      {cart?.shops?.length > 0 && (
        <>
          <div className="cart-grand-total">
            Grand Total: ₱{grandTotal.toFixed(2)}
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Place Order
          </button>
        </>
      )}
    </div>
  );
}
