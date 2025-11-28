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
  "merienda","lutong ulam","lutong gulay","rice meal",
  "almusal","dessert","delicacy","specialty","frozen",
  "pulutan","refreshment"
];

const TIMESLOTS = [
  "5am - 5:30am","7am - 7:30am","9am - 9:30am","11am - 11:30am",
  "1pm - 1:30pm","3pm - 3:30pm","5pm - 5:30pm","7pm - 7:30pm",
];

// Helpers
const parseAMPM = t => {
  const [_, h, ap] = t.match(/(\d+)(am|pm)/i) || [];
  let hour = parseInt(h);
  if (ap === "pm" && hour !== 12) hour += 12;
  if (ap === "am" && hour === 12) hour = 0;
  return hour;
};

const slotToISO = slot => {
  if (!slot) return null;
  const hour = parseAMPM(slot);
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export default function ProductSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await fetchShop();
      setShop(s);

      if (id) {
        const found = (await fetchSellerProducts()).find(p => p.id == id);
        setProduct({ ...found, delivery_time_label: "" });
      } else {
        setProduct({
          name: "", description: "", price: 0, stock: 0, category: "",
          image_url: "", status: true, delivery_date: null,
          delivery_time: null, delivery_time_label: "",
          cross_comm_delivery: false, cross_comm_charge: 0,
        });
      }
    })();
  }, [id]);

  if (!product || !shop || !user) return <p className="loading">Fetching product...</p>;

  const update = (k, v) => setProduct({ ...product, [k]: v });

  const save = async () => {
    const body = { ...product, shop_id: shop.id };
    id ? await updateProduct(id, body) : await createProduct(body);
    navigate("/seller/products");
  };

  const remove = async () => {
    if (window.confirm("Delete this product permanently?")) {
      await deleteProduct(id);
      navigate("/seller/products");
    }
  };

  const Section = ({ name, children }) => (
    <div className="settings-section">
      <div className="section-header" >
        <h3>{name.toUpperCase()}</h3>
      </div>
      
      <div className="section-body">{children}</div>
    </div>
  );

  return (
    <div className="settings-page">
      <h2 className="settings-title">{id ? "Edit Product" : "Create Product"}</h2>

      {/* BASIC INFO */}
      <Section name="basic">
        <div className="settings-item">
          <label>Product Name</label>
          <input value={product.name} onChange={e => update("name", e.target.value)} />
        </div>

        <div className="settings-item">
          <label>Description</label>
          <textarea value={product.description} onChange={e => update("description", e.target.value)} />
        </div>

        <div className="settings-item">
          <label>Category</label>
          <select value={product.category} onChange={e => update("category", e.target.value)}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="settings-item">
          <label>Price (₱)</label>
          <input type="number" min="0"
            value={product.price}
            onChange={e => update("price", parseFloat(e.target.value))}/>
        </div>

        <div className="settings-item">
          <label>Product Image</label>
          <input type="file" onChange={e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => update("image_url", reader.result);
            file && reader.readAsDataURL(file);
          }} />
          {product.image_url && <img src={product.image_url} className="image-preview" />}
        </div>
      </Section>

      {/* INVENTORY */}
      <Section name="inventory">
        <div className="settings-item">
          <label>Available Stock</label>
          <input type="number" min="0"
            value={product.stock} onChange={e => update("stock", +e.target.value)} />
        </div>
      </Section>

      {/* DELIVERY TIME */}
      <Section name="delivery time">
        <div className="settings-item">
          <label>Delivery Date</label>
          <input type="date"
            value={product.delivery_date?.substring(0,10) || ""}
            onChange={e => update("delivery_date", e.target.value)} />
        </div>

        <div className="settings-item">
          <label>Delivery Time</label>
          <select
            value={product.delivery_time_label}
            onChange={e => update("delivery_time", slotToISO(e.target.value))}
          >
            <option value="">Select time slot</option>
            {TIMESLOTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Section>

      {/* DELIVERY OPTIONS */}
      {/* DELIVERY OPTIONS */}
      <Section name="delivery options">
        <div className="cross-delivery-row">
          <label>
            {user.community === "Sampaguita West"
              ? "Deliver to Sampaguita Homes"
              : "Deliver to Sampaguita West"}
          </label>
          
          <input
            type="checkbox"
            checked={product.cross_comm_delivery}
            onChange={e => update("cross_comm_delivery", e.target.checked)}
          />
        </div>

        <div className="settings-item">
          <label>Extra Delivery Charge (₱)</label>
          <input
            type="number"
            disabled={!product.cross_comm_delivery}
            value={product.cross_comm_charge}
            onChange={e => update("cross_comm_charge", +e.target.value)}
          />
        </div>
      </Section>

      {/* BUTTONS */}
      <div className="settings-actions">
        <button className="save-btn" onClick={save}>
          {id ? "Save Changes" : "Add Product"}
        </button>

        {id && (
          <button className="delete-btn" onClick={remove}>
            Delete Product
          </button>
        )}
      </div>
    </div>
  );
}
