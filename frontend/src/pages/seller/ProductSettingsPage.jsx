import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSellerProducts,
  updateProduct,
  createProduct,
  deleteProduct,
} from "../../api/seller/products";
import { fetchShop } from "../../api/seller/shops";
import { useAuthContext } from "../../context/AuthProvider";
import "../../css/pages/seller/product_settings.css";
import { localDateString } from "../../utils/deliveryDateTime";

// ----------------- CONSTANTS -----------------
const CATEGORIES = [
  "merienda", "lutong ulam", "lutong gulay", "rice meal", "pasta",
  "almusal", "dessert", "delicacy", "specialty", "frozen", "pulutan", "refreshment",
];

const TIME_HOURS = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

const parseAMPM = (t) => {
  const [_, h, ap] = t.match(/(\d+)(am|pm)/i) || [];
  let hour = parseInt(h);
  if (ap === "pm" && hour !== 12) hour += 12;
  if (ap === "am" && hour === 12) hour = 0;
  return hour;
};

const slotToDate = (slot, referenceDate = new Date()) => {
  if (!slot) return null;
  const hour = parseAMPM(slot);
  const date = new Date(referenceDate);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const buildTimeSlots = () => TIME_HOURS.map((hour, i) => {
  const isPM = i >= 6;
  return { hour, label: `${hour}${isPM ? "pm" : "am"} - ${hour}:30${isPM ? "pm" : "am"}` };
});

// ----------------- COMPONENT -----------------
export default function ProductSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [basicInfoOpen, setBasicInfoOpen] = useState(false);

  const update = (key, value) => setProduct(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    (async () => {
      const s = await fetchShop();
      setShop(s);

      const today = new Date();
      const todayStr = localDateString(today);
      const eightPM = new Date(today);
      eightPM.setHours(20, 0, 0, 0);

      let initialProduct;
      if (id) {
        const prods = await fetchSellerProducts();
        const found = prods.find(p => p.id === parseInt(id));
        initialProduct = {
          ...found,
          delivery_date: found.delivery_date ? localDateString(new Date(found.delivery_date)) : todayStr,
          delivery_time: found.delivery_time ? new Date(found.delivery_time) : eightPM,
          // IMPORTANT: do NOT highlight on load
          delivery_time_label: "",
        };
      } else {
        initialProduct = {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          category: "",
          image_url: "",
          status: true,
          preorder_delivery: false,
          delivery_date: todayStr,
          delivery_time: eightPM,
          delivery_time_label: "",
          cross_comm_delivery: false,
        };
      }

      setProduct(initialProduct);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !product || !shop || !user) return <p className="loading">Loading...</p>;

  // ----------------- SAVE PRODUCT -----------------
  const saveProduct = async () => {
    const today = new Date();
    const todayStr = localDateString(today);

    let deliveryDate = product.delivery_date;
    let deliveryTime = product.delivery_time;

    if (!product.preorder_delivery) {
      deliveryDate = todayStr;
      const defaultTime = new Date(Date.now() + 30 * 60 * 1000);
      deliveryTime = defaultTime;
    }

    let gap = 0;
    if (product.preorder_delivery && deliveryDate) {
      const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const d2 = new Date(deliveryDate);
      const d2Clean = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
      gap = Math.max(Math.floor((d2Clean - d1) / (1000 * 60 * 60 * 24)), 0);
    }

    // Include cross_comm_delivery only
    const body = {
      ...product,
      shop_id: shop.id,
      preorder_delivery: product.preorder_delivery,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime,
      delivery_date_gap: gap,
      cross_comm_delivery: product.cross_comm_delivery, // ✅ keep checkbox value
    };

    if (id) await updateProduct(id, body);
    else await createProduct(body);

    navigate("/seller/products");
  };


  const deleteProductHandler = async () => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    navigate("/seller/products");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("image_url", reader.result);
    reader.readAsDataURL(file);
  };

  const getDeliveryLabel = (product) => {
    if (!product.preorder_delivery) return "In 30 minutes";

    const todayStr = localDateString(new Date());
    const tomorrowStr = localDateString(new Date(Date.now() + 24 * 60 * 60 * 1000));

    let dayLabel = product.delivery_date;
    if (product.delivery_date === todayStr) dayLabel = "Today";
    else if (product.delivery_date === tomorrowStr) dayLabel = "Tomorrow";

    // If no label yet, build from delivery_time
    const timeLabel = product.delivery_time_label
      || (() => {
        if (!product.delivery_time) return "";
        const hour = product.delivery_time.getHours();
        const minutes = product.delivery_time.getMinutes();
        const formatHour = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour >= 12 ? "pm" : "am";
        const nextHalfHour = minutes === 0 ? `${formatHour}:30${ampm}` : `${formatHour + 1}:00${ampm}`;
        return `${formatHour}${ampm} - ${nextHalfHour}`;
      })();

    return `${dayLabel}, ${timeLabel}`;
  };

  const communityText = user.community === "Sampaguita West"
    ? "Deliver to Sampaguita Homes"
    : "Deliver to Sampaguita West";

  // ----------------- JSX -----------------
  return (
    <div className="settings-page">
      <h2 className="settings-title">{id ? "Edit Product" : "Create Product"}</h2>

      {/* BASIC INFO */}
      <div className="settings-section">
        <div className="section-header" onClick={() => setBasicInfoOpen(!basicInfoOpen)}>
          <h3>{product.name || "Basic Info"}</h3>
          <span>{basicInfoOpen ? "-" : "+"}</span>
        </div>
        {basicInfoOpen && (
          <div className="section-body">
            <div className="settings-item">
              <label>Product Name</label>
              <input type="text" value={product.name || ""} onChange={e => update("name", e.target.value)} />
            </div>
            <div className="settings-item">
              <label>Description</label>
              <textarea value={product.description || ""} onChange={e => update("description", e.target.value)} />
            </div>
            <div className="settings-item">
              <label>Category</label>
              <select value={product.category || ""} onChange={e => update("category", e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="settings-item">
              <label>Price (₱)</label>
              <input type="number" min="0" value={product.price ?? ""} placeholder="0"
                onChange={e => update("price", e.target.value === "" ? null : parseFloat(e.target.value))} />
            </div>
            <div className="settings-item">
              <label>Product Image</label>
              <input type="file" onChange={handleImageUpload} />
              {product.image_url && <img src={product.image_url} className="image-preview" />}
            </div>
          </div>
        )}
      </div>

      {/* INVENTORY */}
      <div className="settings-section">
        <div className="section-header"><h3>Inventory</h3></div>
        <div className="section-body">
          <div className="settings-item">
            <label>Available Stock</label>
            <input type="number" min="0" value={product.stock ?? ""} placeholder="0"
              onChange={e => update("stock", e.target.value === "" ? null : parseInt(e.target.value))} />
          </div>
        </div>
      </div>

      {/* DELIVERY TIME */}
      <div className="settings-section">
        <div className="section-header"><h3>Delivery Time</h3></div>
        <div className="section-body">
          <div className="cross-delivery-row">
            <label>Pre-Order Delivery</label>
            <input
              type="checkbox"
              checked={product.preorder_delivery ?? false}
              onChange={e => {
                const checked = e.target.checked;
                update("preorder_delivery", checked);

                if (!checked) {
                  const todayStr = localDateString(new Date());
                  const defaultTime = new Date(Date.now() + 30 * 60 * 1000);
                  update("delivery_date", todayStr);
                  update("delivery_time", defaultTime);
                  update("delivery_time_label", "");
                } else {
                  // only on manual toggle we pick first available slot
                  const now = new Date();
                  const todayStr = localDateString(now);
                  let slots = buildTimeSlots().map(slot => {
                    const slotDate = slotToDate(slot.label, new Date(todayStr));
                    const isPast = slotDate < new Date(now.getTime() + 60 * 60 * 1000);
                    return { ...slot, isPast };
                  });
                  slots = [...slots.filter(s => !s.isPast), ...slots.filter(s => s.isPast)];
                  const firstAvailableSlot = slots.find(s => !s.isPast) || slots[0];

                  update("delivery_time_label", firstAvailableSlot.label);
                  update(
                    "delivery_time",
                    slotToDate(
                      firstAvailableSlot.label,
                      new Date(firstAvailableSlot.isPast ? Date.now() + 24 * 60 * 60 * 1000 : todayStr)
                    )
                  );
                  update(
                    "delivery_date",
                    firstAvailableSlot.isPast
                      ? localDateString(new Date(Date.now() + 24 * 60 * 60 * 1000))
                      : todayStr
                  );
                }
              }}
            />
          </div>

          <label className="delivery-date-label">
            Delivery: <span>{getDeliveryLabel(product)}</span>
          </label>

          <div className={`time-picker ${!product.preorder_delivery ? "disabled" : ""}`}>
            {(() => {
              const now = new Date();
              const todayStr = localDateString(now);
              let slots = buildTimeSlots().map(slot => {
                const slotDate = slotToDate(slot.label, new Date(todayStr));
                const isPast = slotDate < new Date(now.getTime() + 60 * 60 * 1000);
                return { ...slot, isPast };
              });
              slots = [...slots.filter(s => !s.isPast), ...slots.filter(s => s.isPast)];
              return slots.map((slot, i) => {
                const isSelected = slot.label === product.delivery_time_label;
                return (
                  <div
                    key={i}
                    className={`time-box ${isSelected ? "selected" : ""} ${slot.isPast ? "past" : ""}`}
                    onClick={() => {
                      if (!product.preorder_delivery) return;
                      const slotDeliveryDate = slot.isPast
                        ? localDateString(new Date(Date.now() + 24 * 60 * 60 * 1000))
                        : localDateString(new Date());
                      update("delivery_time_label", slot.label);
                      update("delivery_time", slotToDate(slot.label, new Date(slotDeliveryDate)));
                      update("delivery_date", slotDeliveryDate);
                    }}
                  >
                    {slot.hour}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* CROSS-COMMUNITY DELIVERY */}
      <div className="settings-section">
        <div className="section-header"><h3>Delivery Options</h3></div>
        <div className="section-body">
          <div className="cross-delivery-row">
            <label>{communityText}</label>
            <input
              type="checkbox"
              checked={product.cross_comm_delivery || false}
              onChange={e => update("cross_comm_delivery", e.target.checked)}
            />
          </div>

        </div>
      </div>

      {/* BUTTONS */}
      <div className="settings-actions">
        <button className="save-btn" onClick={saveProduct}>{id ? "Save Changes" : "Add Product"}</button>
        <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
        {id && <button className="delete-btn" onClick={deleteProductHandler}>Delete Product</button>}
      </div>
    </div>
  );
}
