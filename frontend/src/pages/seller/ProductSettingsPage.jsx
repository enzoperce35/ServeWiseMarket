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

// CONSTANTS
const CATEGORIES = [
  "merienda",
  "lutong ulam",
  "lutong gulay",
  "rice meal",
  "pasta",
  "almusal",
  "dessert",
  "delicacy",
  "specialty",
  "frozen",
  "pulutan",
  "refreshment",
];

const TIMESLOTS = [
  "5am - 5:30am",
  "6am - 6:30am",
  "7am - 7:30am",
  "8am - 8:30am",
  "9am - 9:30am",
  "10am - 10:30am",
  "11am - 11:30am",
  "12pm - 12:30pm",
  "1pm - 1:30pm",
  "2pm - 2:30pm",
  "3pm - 3:30pm",
  "4pm - 4:30pm",
  "5pm - 5:30pm",
  "6pm - 6:30pm",
  "7pm - 7:30pm",
  "8pm - 8:30pm",
];

// Helpers
const parseAMPM = (t) => {
  const [_, h, ap] = t.match(/(\d+)(am|pm)/i) || [];
  let hour = parseInt(h);
  if (ap === "pm" && hour !== 12) hour += 12;
  if (ap === "am" && hour === 12) hour = 0;
  return hour;
};

// Convert timeslot string to a Date in local timezone
const slotToDate = (slot, referenceDate = new Date()) => {
  if (!slot) return null;
  const hour = parseAMPM(slot);
  const date = new Date(referenceDate);
  date.setHours(hour, 0, 0, 0);
  return date;
};

export default function ProductSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Safe update function
  const update = (key, value) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };

  // Load shop + product
  useEffect(() => {
    (async () => {
      const s = await fetchShop();
      setShop(s);

      const todayStr = new Date().toISOString().split("T")[0]; // today yyyy-mm-dd

      if (id) {
        const prods = await fetchSellerProducts();
        const found = prods.find((p) => p.id === parseInt(id));
        setProduct({
          ...found,
          delivery_date: todayStr,    // always today
          delivery_time: null,        // always null
          delivery_time_label: "",    // always empty
          pre_order_delivery: true,
        });
      } else {
        setProduct({
          name: "",
          description: "",
          price: 0,
          stock: 0,
          category: "",
          image_url: "",
          status: true,
          delivery_date: todayStr,    // always today
          delivery_time: null,
          delivery_time_label: "",
          pre_order_delivery: true,
          cross_comm_delivery: false,
          cross_comm_charge: 0,
        });
      }

      setLoading(false);
    })();
  }, [id]);

  if (loading || !product || !shop || !user)
    return <p className="loading">Loading...</p>;

  const saveProduct = async () => {
    const body = {
      ...product,
      shop_id: shop.id,
      delivery_date: product.pre_order_delivery ? product.delivery_date : null,
      delivery_time: product.pre_order_delivery ? product.delivery_time : null,
    };

    if (id) await updateProduct(id, body);
    else await createProduct(body);

    navigate("/seller/products");
  };

  const deleteProductHandler = async () => {
    if (!window.confirm("Delete this product permanently?")) return;
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

  const communityText =
    user.community === "Sampaguita West"
      ? "Deliver to Sampaguita Homes"
      : "Deliver to Sampaguita West";

  // Disable past timeslots if delivery date is today or null
  const getDisabledTimes = () => {
    if (!product.pre_order_delivery) return TIMESLOTS.map(() => true);

    const today = new Date();
    const selectedDate = product.delivery_date
      ? new Date(product.delivery_date)
      : today;

    // If selected date is not today, all slots enabled
    if (selectedDate.toDateString() !== today.toDateString())
      return TIMESLOTS.map(() => false);

    const now = new Date();
    const minTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    return TIMESLOTS.map((slot) => {
      const slotDate = slotToDate(slot, selectedDate);
      return slotDate < minTime;
    });
  };

  const disabledTimes = getDisabledTimes();

  return (
    <div className="settings-page">
      <h2 className="settings-title">{id ? "Edit Product" : "Create Product"}</h2>

      {/* BASIC INFO */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Basic Information</h3>
        </div>
        <div className="section-body">
          <div className="settings-item">
            <label>Product Name</label>
            <input
              type="text"
              value={product.name || ""}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="settings-item">
            <label>Description</label>
            <textarea
              value={product.description || ""}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div className="settings-item">
            <label>Category</label>
            <select
              value={product.category || ""}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-item">
            <label>Price (₱)</label>
            <input
              type="number"
              min="0"
              value={product.price || 0}
              onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="settings-item">
            <label>Product Image</label>
            <input type="file" onChange={handleImageUpload} />
            {product.image_url && (
              <img src={product.image_url} className="image-preview" />
            )}
          </div>
        </div>
      </div>

      {/* INVENTORY */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Inventory</h3>
        </div>
        <div className="section-body">
          <div className="settings-item">
            <label>Available Stock</label>
            <input
              type="number"
              min="0"
              value={product.stock || 0}
              onChange={(e) => update("stock", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* DELIVERY TIME */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Delivery Time</h3>
        </div>
        <div className="section-body">
          {/* Pre-Order Delivery Checkbox */}
          <div className="cross-delivery-row">
            <label>Pre-Order Delivery</label>
            <input
              type="checkbox"
              checked={product.pre_order_delivery ?? true}
              onChange={(e) => {
                const checked = e.target.checked;
                update("pre_order_delivery", checked);
                if (!checked) {
                  update("delivery_date", null);
                  update("delivery_time", null);
                  update("delivery_time_label", "");
                } else if (!product.delivery_date) {
                  update(
                    "delivery_date",
                    new Date().toISOString().split("T")[0]
                  );
                }
              }}
            />
          </div>

          <div className="settings-item">
            <label>Delivery Date</label>
            <input
              type="date"
              value={product.delivery_date || new Date().toISOString().split("T")[0]}
              onChange={(e) => update("delivery_date", e.target.value)}
              disabled={!product.pre_order_delivery}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="settings-item">
            <label>Delivery Time</label>
            <select
              value={product.delivery_time_label || ""}
              onChange={(e) => {
                const label = e.target.value;
                update("delivery_time_label", label);
                update(
                  "delivery_time",
                  slotToDate(label, new Date(product.delivery_date))
                );
              }}
              disabled={!product.pre_order_delivery}
            >
              <option value="">Select time slot</option>
              {TIMESLOTS.map((slot, index) => (
                <option key={slot} value={slot} disabled={disabledTimes[index]}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CROSS COMMUNITY DELIVERY */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Delivery Options</h3>
        </div>
        <div className="section-body">
          <div className="cross-delivery-row">
            <label>{communityText}</label>
            <input
              type="checkbox"
              checked={product.cross_comm_delivery || false}
              onChange={(e) =>
                update("cross_comm_delivery", e.target.checked)
              }
            />
          </div>

          <div className="settings-item">
            <label>Extra Delivery Charge (₱)</label>
            <input
              type="number"
              disabled={!product.cross_comm_delivery}
              value={product.cross_comm_charge || 0}
              onChange={(e) =>
                update("cross_comm_charge", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="settings-actions">
        <button className="save-btn" onClick={saveProduct}>
          {id ? "Save Changes" : "Add Product"}
        </button>

        {id && (
          <button className="delete-btn" onClick={deleteProductHandler}>
            Delete Product
          </button>
        )}
      </div>
    </div>
  );
}
