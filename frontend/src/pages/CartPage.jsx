import React, { useState } from "react";
import { useCartContext } from "../context/CartProvider";
import { useAuthContext } from "../context/AuthProvider";
import { addToCartApi, removeFromCartApi, deductStockApi } from "../api/cart";
import { formatDeliveryLabel, getDeliverySortScore } from "../utils/deliverySlotRotation";
import { mergeSameProductsInGroup } from "../utils/cartsHelper";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/common/BackButton";
import toast from "react-hot-toast";
import "../css/pages/CartPage.css";

export default function CartPage() {
  const { cart, fetchCart, setCart } = useCartContext();
  const { token } = useAuthContext();
  const navigate = useNavigate();

  const [activeItem, setActiveItem] = useState(null);
  const [draftQty, setDraftQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [stockError, setStockError] = useState(null);

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

  const openQtyModal = (item) => {
    setActiveItem(item);
    setDraftQty(item.quantity || 1);
  };
  //.sort(([a], [b])
  const increaseLocal = () => setDraftQty((q) => q + 1);
  const decreaseLocal = () => setDraftQty((q) => Math.max(1, q - 1));

  const saveQuantity = async () => {
    if (!activeItem) return;
  
    try {
      setSaving(true);
  
      const current = Number(activeItem.quantity);
      const target = Number(draftQty);
  
      // nothing changed
      if (target === current) {
        setActiveItem(null);
        return;
      }
  
      // 🧹 if target becomes 0 → delete item completely
      if (target === 0) {
        await removeFromCartApi(activeItem.cart_item_id, token);
      } else {
        // 🔥 easiest + always correct:
        // remove the line item then re-add the correct quantity
  
        // 1) remove item
        await removeFromCartApi(activeItem.cart_item_id, token);
  
        // 2) re-add with target quantity
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
      console.error("Update failed:", err);
      toast.error("Could not update quantity.");
    } finally {
      setSaving(false);
    }
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

  const handleCopyTicket = async () => {
    try {
      const now = new Date();
      const displayTimestamp = formatCopyTimestamp(now);
      const MAX_NAME_WIDTH = 22;
      const PRICE_COLUMN_START = 35;
  
      let text = "";
  
      cart.shops.forEach((shop) => {
        text += `🏪 ${shop.shop_name}\n`;
        text += `🧾 ${displayTimestamp}\n\n`;
  
        const groups = {};
  
        shop.items.forEach((item) => {
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
  
        const totalItems = shop.items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
        text += "------------------------------------------\n";
        text += ` Items(${totalItems})`.padEnd(PRICE_COLUMN_START) + `Total: ₱${grandTotal.toFixed(2)}\n\n`;
      });
  
      // 🔴 STOCK VALIDATION (parent product stock)
      const allItems = cart.shops.flatMap((shop) => shop.items);
      const productTotals = {};
  
      allItems.forEach((item) => {
        if (!productTotals[item.product_id]) {
          productTotals[item.product_id] = { name: item.name, stock: item.stock, qty: 0 };
        }
        productTotals[item.product_id].qty += Number(item.quantity || 0);
      });
  
      for (let pid in productTotals) {
        const { name, stock, qty } = productTotals[pid];
        const remaining = Number(stock || 0);
        if (remaining < qty) {
          setStockError(`Not enough stock for "${name}". Ordered ${qty}, only ${remaining} left.`);
          return; // ❌ stop execution
        }
      }
  
      // ✅ copy ticket to clipboard
      await navigator.clipboard.writeText(text);
      toast.success("Ticket copied to clipboard 📋");
  
      if (token) {
        // 🟢 logged-in: deduct stock and clear API cart
        for (let pid in productTotals) {
          const { qty } = productTotals[pid];
          await deductStockApi(pid, qty, token, null);
        }
  
        await Promise.all(allItems.map((item) => removeFromCartApi(item.cart_item_id, token)));
        await fetchCart();
      } else {
        // 🟢 guest: just clear local cart
        setCart({ shops: [] });
      }
  
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
      const key =
        item.delivery_group_name ||
        item.delivery_time ||
        "No delivery group";

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

      {(!cart || cart.shops.length === 0) && (
        <p className="cart-empty">Your cart is empty.</p>
      )}

      {cart?.shops?.map((shop) => (
        <div key={shop.shop_id} className="cart-shop">
          <h3>{shop.shop_name}</h3>

          {Object.entries(groupItemsByDeliveryGroup(shop.items))
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

                      <span className="cart-item-qty">
                        Qty: {item.quantity}
                      </span>

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
              </div>
            ))}

          <div className="cart-shop-subtotal">
            Subtotal: ₱
            {shop.items
              .reduce(
                (sum, item) => sum + Number(item.total_price || 0),
                0
              )
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

      {activeItem && (
        <div
          className="qty-modal-backdrop"
          onClick={() => setActiveItem(null)}
        >
          <div className="qty-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {activeItem.name}
              {activeItem.variant ? ` (${activeItem.variant.name})` : ""}
            </h3>

            <p className="modal-delivery-slot" style={{ color: '#666', fontSize: '0.9rem' }}>
              {/* ✅ Use the name from the API, which now fallbacks to "Now" */}
              {formatDeliveryLabel(activeItem.delivery_group_name)}

            </p>

            <p>Adjust quantity</p>

            <div className="qty-controls">
              <button className="qty-btn" onClick={decreaseLocal}>
                –
              </button>
              <span className="qty-number">{draftQty}</span>
              <button className="qty-btn" onClick={increaseLocal}>
                +
              </button>
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

            <button
              className="qty-close"
              onClick={() => setActiveItem(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stock Error Modal */}
      {stockError && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Stock Error</h3>
            <p>{stockError}</p>
            <button
              className="modal-ok-btn"
              onClick={() => setStockError(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
