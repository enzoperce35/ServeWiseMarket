import React from "react";
import { useCartContext } from "../context/CartProvider";
import { useAuthContext } from "../context/AuthProvider";
import { removeFromCartApi } from "../api/cart";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/common/BackButton";
import toast from "react-hot-toast";
import "../css/pages/CartPage.css";

export default function CartPage() {
  const { cart, fetchCart } = useCartContext();
  const { token } = useAuthContext();
  const navigate = useNavigate();

  // Calculate grand total safely
  const grandTotal =
    cart?.shops?.reduce((acc, shop) => {
      const shopTotal = shop.items.reduce(
        (sum, item) => sum + Number(item.total_price || 0),
        0
      );
      return acc + shopTotal;
    }, 0) || 0;

  // 📌 COPY TICKET
  const handleCopyTicket = async () => {
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    try {
      // ===== Generate ticket number =====
      const ticketNumber = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, "")
        .slice(2, 14);

      // ===== Group items by shop and delivery group =====
      const shopsData = cart.shops.map((shop) => {
        const groups = {};

        shop.items.forEach((item) => {
          // Use delivery_group_name if exists, else fallback
          const label =
            item.delivery_group_name ||
            item.delivery_time ||
            "No delivery group";

          if (!groups[label]) groups[label] = [];
          groups[label].push(item);
        });

        return { shop, groups };
      });

      // ===== Save raw ticket to localStorage =====
      const ticketPayload = {
        ticket_number: ticketNumber,
        grand_total: grandTotal,
        shops: shopsData,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("order_ticket", JSON.stringify(ticketPayload));

      // ===== Build formatted ticket text =====
      let text = "";

      shopsData.forEach(({ shop, groups }) => {
        text += `🏪 ${shop.shop_name}\n`;
        text += `🧾 ${ticketNumber}\n\n`;

        Object.keys(groups).forEach((groupLabel) => {
          text += `🚚 ${groupLabel}\n`;

          groups[groupLabel].forEach((i) => {
            // Format multi-line product name nicely
            const productName = i.variant?.name
              ? `${i.name} (${i.variant.name})`
              : i.name;

            // Align quantity and price roughly with tabs
            const qty = `x${i.quantity}`;
            const price = `₱${Number(i.total_price || 0).toFixed(2)}`;

            text += `  • ${productName} ${qty}\t\t${price}\n`;
          });

          text += `\n`;
        });

        text += "-----------------------------------\n";

        const totalItems = shop.items.reduce(
          (sum, i) => sum + Number(i.quantity || 0),
          0
        );

        text += `  Items(${totalItems})                 Total: ₱${grandTotal.toFixed(
          2
        )}\n\n`;
      });

      // ===== Copy to clipboard =====
      await navigator.clipboard.writeText(text);
      toast.success("Ticket copied to clipboard 📋");

      // ===== Clear cart =====
      const allItems = cart.shops.flatMap((shop) => shop.items);
      await Promise.all(
        allItems.map((item) => removeFromCartApi(item.cart_item_id, token))
      );
      await fetchCart();

      // ===== Navigate to products page =====
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy ticket");
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

  return (
    <div className="cart-page">
      <div className="cart-header">
        <BackButton className="cart-back-btn" fallback="/" />
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
                <span className="cart-item-name">
                  {item.name}
                  {item.variant ? `  (${item.variant.name})` : ""}
                </span>
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

          <button className="checkout-btn" onClick={handleCopyTicket}>
            Copy Ticket
          </button>
        </>
      )}
    </div>
  );
}
