import React, { useState } from "react";
import { useCartContext } from "../context/CartProvider";
import { useAuthContext } from "../context/AuthProvider";
import { addToCartApi, removeFromCartApi } from "../api/cart";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/common/BackButton";
import toast from "react-hot-toast";
import "../css/pages/CartPage.css";

export default function CartPage() {
  const { cart, fetchCart } = useCartContext();
  const { token } = useAuthContext();
  const navigate = useNavigate();

  // --- MODAL STATE ---
  const [activeItem, setActiveItem] = useState(null);
  const [draftQty, setDraftQty] = useState(1);
  const [saving, setSaving] = useState(false);

  // --- CALCULATIONS ---
  const grandTotal =
    cart?.shops?.reduce((acc, shop) => {
      const shopTotal = shop.items.reduce(
        (sum, item) => sum + Number(item.total_price || 0),
        0
      );
      return acc + shopTotal;
    }, 0) || 0;

  const getUnitPrice = (item) => {
    if (!item) return 0;
    if (item.unit_price) return Number(item.unit_price);
    if (item.price) return Number(item.price);
    if (item.total_price && item.quantity) {
      return Number(item.total_price) / Number(item.quantity);
    }
    return 0;
  };

  const previewTotal = activeItem ? getUnitPrice(activeItem) * draftQty : 0;

  // --- MODAL ACTIONS ---
  const openQtyModal = (item) => {
    setActiveItem(item);
    setDraftQty(item.quantity || 1);
  };

  const increaseLocal = () => setDraftQty((q) => q + 1);
  const decreaseLocal = () => setDraftQty((q) => Math.max(1, q - 1));

  const saveQuantity = async () => {
    if (!activeItem) return;

    try {
      setSaving(true);
      const current = activeItem.quantity;
      const target = draftQty;

      if (target === current) {
        setActiveItem(null);
        return;
      }

      // Fix applied: Calculate difference and use addToCartApi
      // Positive diff increases, Negative diff decreases without deleting
      const diff = target - current;

      await addToCartApi(
        activeItem.product_id,
        diff,
        token,
        activeItem.variant_id ?? null
      );

      await fetchCart();
      toast.success("Quantity updated");
      setActiveItem(null);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Could not update quantity.");
    } finally {
      setSaving(false);
    }
  };

  // 📌 COPY TICKET LOGIC
  const handleCopyTicket = async () => {
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    try {
      const ticketNumber = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, "")
        .slice(2, 14);

      const shopsData = cart.shops.map((shop) => {
        const groups = {};
        shop.items.forEach((item) => {
          const label = item.delivery_group_name || item.delivery_time || "No delivery group";
          if (!groups[label]) groups[label] = [];
          groups[label].push(item);
        });
        return { shop, groups };
      });

      const ticketPayload = {
        ticket_number: ticketNumber,
        grand_total: grandTotal,
        shops: shopsData,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("order_ticket", JSON.stringify(ticketPayload));

      let text = "";
      shopsData.forEach(({ shop, groups }) => {
        text += `🏪 ${shop.shop_name}\n🧾 ${ticketNumber}\n\n`;
        Object.keys(groups).forEach((groupLabel) => {
          text += `🚚 ${groupLabel}\n`;
          groups[groupLabel].forEach((i) => {
            const productName = i.variant?.name ? `${i.name} (${i.variant.name})` : i.name;
            const qty = `x${i.quantity}`;
            const price = `₱${Number(i.total_price || 0).toFixed(2)}`;
            text += `  • ${productName} ${qty}\t\t${price}\n`;
          });
          text += `\n`;
        });
        text += "-----------------------------------\n";
        const totalItems = shop.items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
        text += `  Items(${totalItems})                 Total: ₱${grandTotal.toFixed(2)}\n\n`;
      });

      await navigator.clipboard.writeText(text);
      toast.success("Ticket copied to clipboard 📋");

      const allItems = cart.shops.flatMap((shop) => shop.items);
      await Promise.all(allItems.map((item) => removeFromCartApi(item.cart_item_id, token)));
      await fetchCart();
      navigate("/");
    } catch (err) {
      toast.error("Failed to copy ticket");
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCartApi(cartItemId, token);
      await fetchCart();
    } catch (err) {
      toast.error(`Remove failed: ${err.message}`);
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
              <div 
                className="cart-item-info" 
                onClick={() => openQtyModal(item)}
                style={{ cursor: "pointer" }}
              >
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
                onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(item.cart_item_id);
                }}
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

      {/* ========= MODAL SECTION ========= */}
      {activeItem && (
        <div className="qty-modal-backdrop" onClick={() => setActiveItem(null)}>
          <div className="qty-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {activeItem.name}
              {activeItem.variant ? ` (${activeItem.variant.name})` : ""}
            </h3>
            <p>Adjust quantity</p>

            <div className="qty-controls">
              <button className="qty-btn" onClick={decreaseLocal}>–</button>
              <span className="qty-number">{draftQty}</span>
              <button className="qty-btn" onClick={increaseLocal}>+</button>
            </div>

            <div className="qty-modal-total">
              New total: ₱{previewTotal.toFixed(2)}
            </div>

            <button
              className="qty-save"
              disabled={saving || draftQty === activeItem.quantity}
              onClick={saveQuantity}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button className="qty-close" onClick={() => setActiveItem(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}