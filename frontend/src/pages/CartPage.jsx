import React, { useState } from "react";
import { useCartContext } from "../context/CartProvider";
import { useAuthContext } from "../context/AuthProvider";
import {
  addToCartApi,
  removeFromCartApi,
  checkoutCartApi,
} from "../api/cart";
import { formatDeliveryLabel, getDeliverySortScore } from "../utils/deliverySlotRotation";
import { mergeSameProductsInGroup } from "../utils/cartsHelper";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/common/BackButton";
import toast from "react-hot-toast";
import "../css/pages/CartPage.css";

export default function CartPage() {
  const { cart, fetchCart, activeShopId, setActiveShopId } = useCartContext();
  const { token } = useAuthContext();
  const navigate = useNavigate();

  const [activeItem, setActiveItem] = useState(null);
  const [draftQty, setDraftQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [stockError, setStockError] = useState(null);

  // ✅ ONLY active shop, no fallback
  const activeShop = activeShopId
    ? cart?.shops?.find(shop => shop.shop_id === activeShopId)
    : null;

  const grandTotal = activeShop
    ? activeShop.items.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
    : 0;

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

  const openQtyModal = (item) => {
    setActiveItem(item);
    setDraftQty(item.quantity || 1);
  };
  const increaseLocal = () => setDraftQty(q => q + 1);
  const decreaseLocal = () => setDraftQty(q => Math.max(1, q - 1));

  const saveQuantity = async () => {
    if (!activeItem) return;
    try {
      setSaving(true);
      const current = Number(activeItem.quantity);
      const target = Number(draftQty);
      if (target === current) {
        setActiveItem(null);
        return;
      }
      if (target === 0) {
        await removeFromCartApi(activeItem.cart_item_id, token);
      } else {
        await removeFromCartApi(activeItem.cart_item_id, token);
        await addToCartApi(
          activeItem.product_id,
          target,
          token,
          activeItem.variant_id ?? null,
          activeItem.delivery_group_id
        );
      }
      await fetchCart();
      toast.success("Quantity updated");
      setActiveItem(null);
    } catch (err) {
      console.error(err);
      toast.error("Could not update quantity.");
    } finally {
      setSaving(false);
    }
  };

  const wrapText = (text, maxLength) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";
    words.forEach((word) => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine === "" ? "" : " ") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const formatCopyTimestamp = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${month}-${day} ${hours}:${minutes}${ampm}`;
  };

  const handleCopyTicket = async () => {
    if (!activeShop || !activeShop.items.length) {
      toast.error("No active shop selected or cart is empty.");
      return;
    }

    try {
      const now = new Date();
      const displayTimestamp = formatCopyTimestamp(now);
      const MAX_NAME_WIDTH = 22;
      const PRICE_COLUMN_START = 35;

      let text = `🏪 ${activeShop.shop_name}\n🧾 ${displayTimestamp}\n\n`;

      // group items by delivery slot
      const groups = {};
      activeShop.items.forEach((item) => {
        const label = item.delivery_group_name || item.delivery_time || "No delivery group";
        if (!groups[label]) groups[label] = [];
        groups[label].push(item);
      });

      Object.keys(groups)
        .sort((a, b) => getDeliverySortScore(a) - getDeliverySortScore(b))
        .forEach((groupLabel) => {
          const displayLabel = formatDeliveryLabel(groupLabel);
          text += `🚚 ${displayLabel}\n`;

          mergeSameProductsInGroup(groups[groupLabel]).forEach((i) => {
            const productName = i.variant?.name ? `${i.name} (${i.variant.name})` : i.name;
            const qtyLabel = `x${i.quantity}`;
            const fullLabel = `${productName} ${qtyLabel}`;
            const price = `₱${Number(i.total_price || 0).toFixed(2)}`;
            const lines = wrapText(fullLabel, MAX_NAME_WIDTH);

            lines.forEach((line, index) => {
              const prefix = index === 0 ? " • " : " ";
              if (index === lines.length - 1) {
                text += (prefix + line).padEnd(PRICE_COLUMN_START) + price + "\n";
              } else {
                text += prefix + line + "\n";
              }
            });
          });

          text += "\n";
        });

      const totalItems = activeShop.items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
      const shopTotal = activeShop.items.reduce((sum, i) => sum + Number(i.total_price || 0), 0);

      text += "------------------------------------------\n";
      text += ` Items(${totalItems})`.padEnd(PRICE_COLUMN_START);
      text += `Total: ₱${shopTotal.toFixed(2)}\n\n`;

      // stock validation
      const productTotals = {};
      activeShop.items.forEach((item) => {
        if (!productTotals[item.product_id]) {
          productTotals[item.product_id] = { name: item.name, stock: item.stock, qty: 0 };
        }
        productTotals[item.product_id].qty += Number(item.quantity || 0);
      });

      for (const pid in productTotals) {
        const { name, stock, qty } = productTotals[pid];
        if (Number(stock || 0) < qty) {
          setStockError(`Not enough stock for "${name}". Ordered ${qty}, only ${stock} left.`);
          return;
        }
      }

      // ✅ copy ticket first
      await navigator.clipboard.writeText(text);
      toast.success("Ticket copied to clipboard 📋");

      // ✅ checkout backend (clears cart)
      await checkoutCartApi(token, activeShop.shop_id);
      
      // ✅ fetch cart fresh
      await fetchCart();

      // ✅ reset active shop
      setActiveShopId(null);

      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to checkout");
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

  const groupItemsByDeliveryGroup = (items) => {
    const groups = {};
    items.forEach((item) => {
      const key = item.delivery_group_name || item.delivery_time || "No delivery group";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <BackButton className="cart-back-btn" fallback="/" />
      </div>

      {(!activeShop || activeShop.items.length === 0) && (
        <p className="cart-empty">Your cart is empty.</p>
      )}

      {activeShop && (
        <div className="cart-shop">
          <h3>{activeShop.shop_name}</h3>

          {Object.entries(groupItemsByDeliveryGroup(activeShop.items))
            .sort(([a], [b]) => getDeliverySortScore(a) - getDeliverySortScore(b))
            .map(([groupLabel, groupedItems]) => (
              <div key={groupLabel} className="delivery-group-block">
                <h4 className="delivery-group-title">🚚 {formatDeliveryLabel(groupLabel)}</h4>

                {mergeSameProductsInGroup(groupedItems).map((item) => (
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
                        {item.variant ? ` (${item.variant.name})` : ""}
                      </span>
                      <span className="cart-item-qty">Qty: {item.quantity}</span>
                      <span className="cart-item-price">₱{Number(item.total_price || 0).toFixed(2)}</span>
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
              </div>
            ))}

          <div className="cart-shop-subtotal">
            Subtotal: ₱{grandTotal.toFixed(2)}
          </div>
        </div>
      )}

      {activeShop && activeShop.items.length > 0 && (
        <button className="checkout-btn" onClick={handleCopyTicket}>
          Copy Ticket
        </button>
      )}

      {activeItem && (
        <div className="qty-modal-backdrop" onClick={() => setActiveItem(null)}>
          <div className="qty-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{activeItem.name}{activeItem.variant ? ` (${activeItem.variant.name})` : ""}</h3>
            <p className="modal-delivery-slot" style={{ color: '#666', fontSize: '0.9rem' }}>
              {formatDeliveryLabel(activeItem.delivery_group_name)}
            </p>
            <p>Adjust quantity</p>
            <div className="qty-controls">
              <button className="qty-btn" onClick={decreaseLocal}>–</button>
              <span className="qty-number">{draftQty}</span>
              <button className="qty-btn" onClick={increaseLocal}>+</button>
            </div>
            <div className="qty-modal-total">
              New total: ₱{previewTotal.toFixed(2)}
            </div>
            <button className="qty-save" disabled={saving || draftQty === activeItem.quantity} onClick={saveQuantity}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="qty-close" onClick={() => setActiveItem(null)}>Cancel</button>
          </div>
        </div>
      )}

      {stockError && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Stock Error</h3>
            <p>{stockError}</p>
            <button className="modal-ok-btn" onClick={() => setStockError(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
