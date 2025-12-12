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
  "merienda", "lutong ulam", "lutong gulay", "rice meal", "pasta",
  "almusal", "dessert", "delicacy", "specialty", "frozen", "pulutan", "refreshment",
];

// TIMESLOTS helper
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

export default function ProductSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [basicInfoOpen, setBasicInfoOpen] = useState(false); // collapsible section

  const update = (key, value) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    (async () => {
      const s = await fetchShop();
      setShop(s);

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const eightPM = new Date(today);
      eightPM.setHours(20, 0, 0, 0);

      if (id) {
        const prods = await fetchSellerProducts();
        const found = prods.find((p) => p.id === parseInt(id));
        const baseDeliveryDate = found.delivery_date
          ? new Date(found.delivery_date).toISOString().split("T")[0]
          : todayStr;
        const baseDeliveryTime = found.preorder_delivery
          ? found.delivery_time
          : eightPM;
        const baseLabel = found.preorder_delivery
          ? found.delivery_time_label || ""
          : "8pm - 8:30pm";

        setProduct({
          ...found,
          delivery_date: baseDeliveryDate,
          delivery_time: baseDeliveryTime,
          delivery_time_label: baseLabel,
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
          preorder_delivery: false,
          delivery_date: todayStr,
          delivery_time: eightPM,
          delivery_time_label: "",
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
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    let deliveryDate = product.delivery_date;
    let deliveryTime = product.delivery_time;

    if (!product.preorder_delivery) {
      deliveryDate = todayStr;
      const eightPM = new Date(today);
      eightPM.setHours(20, 0, 0, 0);
      deliveryTime = eightPM;
    }

    let gap = 0;
    if (product.preorder_delivery && deliveryDate) {
      const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const d2Source = new Date(deliveryDate);
      const d2 = new Date(d2Source.getFullYear(), d2Source.getMonth(), d2Source.getDate());
      const diff = d2 - d1;
      gap = Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0);
    }

    const body = {
      ...product,
      shop_id: shop.id,
      preorder_delivery: product.preorder_delivery,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime,
      delivery_date_gap: gap,
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

  // ----------------- JSX -----------------
  return (
    <div className="settings-page">
      <h2 className="settings-title">{id ? "Edit Product" : "Create Product"}</h2>

      {/* BASIC INFO (collapsible) */}
      <div className="settings-section">
        <div className="section-header" onClick={()=>setBasicInfoOpen(!basicInfoOpen)}>
          <h3>{product.name}</h3>
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
              <input
                type="number"
                min="0"
                value={product.price ?? ""}
                placeholder="0"
                onChange={e => update("price", e.target.value === "" ? null : parseFloat(e.target.value))}
              />
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
            <input
              type="number"
              min="0"
              value={product.stock ?? ""}
              placeholder="0"
              onChange={e => update("stock", e.target.value === "" ? null : parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* DELIVERY DATE / TIME */}
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
                const today = new Date();
                const todayStr = today.toISOString().split("T")[0];
                const defaultTime = new Date(today.getTime() + 30*60*1000);
                if(!checked){
                  update("delivery_date", todayStr);
                  update("delivery_time", defaultTime);
                  update("delivery_time_label", "");
                } else {
                  update("delivery_date", product.delivery_date || todayStr);
                }
              }}
            />
          </div>

          {/* Delivery Date */}
          <label className="delivery-date-label">
            Delivery Date:{" "}
            <span>
              {product.delivery_date
                ? (new Date(product.delivery_date).toDateString() === new Date().toDateString() ? "Today" : new Date(product.delivery_date).toLocaleDateString("en-US",{month:"short", day:"numeric", year:"numeric"}))
                : "Today"}
            </span>
          </label>

          {/* Weekday picker */}
          <div className={`weekday-picker ${!product.preorder_delivery ? "disabled" : ""}`}>
            {Array.from({ length: 7 }).map((_, i) => {
              const today = new Date();
              const dayDate = new Date(today);
              dayDate.setDate(today.getDate() + i);
              const dayLabel = dayDate.toLocaleDateString("en-US",{weekday:"short"});
              const selectedDate = product.delivery_date || today.toISOString().split("T")[0];
              const isSelected = selectedDate === dayDate.toISOString().split("T")[0];
              return (
                <div
                  key={i}
                  className={`weekday-box ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    const clickedDateStr = dayDate.toISOString().split("T")[0];
                    update("delivery_date", clickedDateStr);
                    if(clickedDateStr === new Date().toISOString().split("T")[0]){
                      // today: default first available slot
                      const now = new Date();
                      const availableSlots = [6,7,8,9,10,11,12,1,2,3,4,5,6,7,8]
                        .map((h,j)=>{
                          const pm = j>=6;
                          const lbl = `${h}${pm?"pm":"am"} - ${h}:30${pm?"pm":"am"}`;
                          const dt = slotToDate(lbl,dayDate);
                          return dt >= new Date(now.getTime()+60*60*1000)?lbl:null;
                        }).filter(Boolean);
                      const defaultSlot = availableSlots[0] || "";
                      update("delivery_time_label", defaultSlot);
                      update("delivery_time", slotToDate(defaultSlot,dayDate));
                    } else {
                      // other days: All Day
                      update("delivery_time_label","");
                      update("delivery_time",new Date(dayDate.setHours(0,0,0,0)));
                    }
                  }}
                >{dayLabel}</div>
              );
            })}
          </div>

          {/* Delivery Time Picker */}
          <label className="delivery-date-label">
            Delivery Time:{" "}
            <span>
              {product.preorder_delivery
                ? (product.delivery_time_label || "All Day")
                : "In 30 minutes"}
            </span>
          </label>
          <div className={`time-picker ${!product.preorder_delivery ? "disabled" : ""}`}>
            {[6,7,8,9,10,11,12,1,2,3,4,5,6,7,8].map((hour,i)=>{
              const isPM = i>=6;
              const displayHour = hour;
              const label = `${displayHour}${isPM?"pm":"am"} - ${displayHour}:30${isPM?"pm":"am"}`;
              const now = new Date();
              const todayStr = now.toISOString().split("T")[0];
              const selectedDate = product.delivery_date || todayStr;
              const slotDate = slotToDate(label,new Date(selectedDate));
              const isPastTime = selectedDate === todayStr && slotDate < new Date(now.getTime()+60*60*1000);
              let isSelected = false;
              if(selectedDate===todayStr){
                const availableSlots = [6,7,8,9,10,11,12,1,2,3,4,5,6,7,8]
                  .map((h,j)=>{
                    const pm = j>=6;
                    const lbl = `${h}${pm?"pm":"am"} - ${h}:30${pm?"pm":"am"}`;
                    const dt = slotToDate(lbl,new Date(selectedDate));
                    return dt >= new Date(now.getTime()+60*60*1000)?lbl:null;
                  }).filter(Boolean);
                const defaultSlot = availableSlots[0] || "";
                isSelected = label === (product.delivery_time_label || defaultSlot);
              } else {
                isSelected = label === product.delivery_time_label;
              }

              return (
                <div
                  key={i}
                  className={`time-box ${isSelected?"selected":""} ${!product.preorder_delivery || isPastTime?"disabled":""}`}
                  onClick={()=>{
                    if(!product.preorder_delivery || isPastTime) return;
                    update("delivery_time_label",label);
                    update("delivery_time",slotToDate(label,new Date(product.delivery_date)));
                  }}
                >{displayHour}</div>
              );
            })}
          </div>

        </div>
      </div>

      {/* CROSS COMMUNITY DELIVERY */}
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
          <div className="settings-item">
            <label>Extra Delivery Charge (₱)</label>
            <input
              type="number"
              disabled={!product.cross_comm_delivery}
              value={product.cross_comm_charge ?? ""}
              placeholder="0"
              onChange={e => update("cross_comm_charge", e.target.value===""?null:parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="settings-actions">
        <button className="save-btn" onClick={saveProduct}>
          {id ? "Save Changes" : "Add Product"}
        </button>
        <button className="cancel-btn" onClick={()=>navigate(-1)}>Cancel</button>
        {id && <button className="delete-btn" onClick={deleteProductHandler}>Delete Product</button>}
      </div>
    </div>
  );
}
