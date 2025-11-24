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

export default function ProductSettingsPage() {
  const { id } = useParams(); // null → create, not null → edit
  const navigate = useNavigate();
  const { user } = useAuthContext(); // current logged-in user

  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Section toggles
  const [openSection, setOpenSection] = useState({
    basic: true,
    inventory: true,
    delivery: true,
    crossDelivery: true,
  });

  // Dropdown options
  const categoryOptions = [
    "merienda",
    "lutong ulam",
    "lutong gulay",
    "rice meal",
    "almusal",
    "dessert",
    "delicacy",
    "specialty",
    "frozen",
    "pulutan",
    "refreshment",
  ];

  const deliveryTimeSlots = [
    "5am - 5:30am",
    "7am - 7:30am",
    "9am - 9:30am",
    "11am - 11:30am",
    "1pm - 1:30pm",
    "3pm - 3:30pm",
    "5pm - 5:30pm",
    "7pm - 7:30pm",
  ];

  // --- Helper functions ---
  function parseAMPM(timeStr) {
    const match = timeStr.match(/(\d+)(am|pm)/i);
    if (!match) return [0, 0];
    let hours = parseInt(match[1]);
    const ampm = match[2].toLowerCase();
    if (ampm === "pm" && hours !== 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    return [hours, 0];
  }

  function parseFirstTime(slot) {
    if (!slot) return null;
    const first = slot.split(" - ")[0].trim();
    const [hours, minutes] = parseAMPM(first);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    return today;
  }

  function formatTimeLabel(date) {
    const hours = date.getHours();
    const ampm = hours >= 12 ? "pm" : "am";
    const h = hours % 12 === 0 ? 12 : hours % 12;
    return `${h}${ampm} - ${h + 1}${ampm}`;
  }

  // Load shop + product
  useEffect(() => {
    const load = async () => {
      const s = await fetchShop();
      setShop(s);

      if (id) {
        const prods = await fetchSellerProducts();
        const p = prods.find((x) => x.id === parseInt(id));
        setProduct({
          ...p,
          delivery_time_label: p.delivery_time
            ? formatTimeLabel(new Date(p.delivery_time))
            : "",
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
          delivery_date: null,
          delivery_time: null,
          delivery_time_label: "",
          cross_comm_delivery: false,
          cross_comm_charge: 0,
        });
      }

      setLoading(false);
    };

    load();
  }, [id]);

  if (loading || !product || !shop || !user) return <p>Loading...</p>;

  // Use user.community and user.phase
  const communityText =
    user.community === "Sampaguita West"
      ? "Deliver to Sampaguita Homes"
      : "Deliver to Sampaguita West";

  const handleSave = async () => {
    const payload = { ...product, shop_id: shop.id };

    if (id) {
      await updateProduct(product.id, payload);
    } else {
      await createProduct(payload);
    }

    navigate("/seller/products");
  };

  const handleDelete = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    if (!ok) return;

    await deleteProduct(product.id);
    navigate("/seller/products");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProduct({ ...product, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSection = (section) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="settings-page">
      <h2 className="settings-title">{id ? "Edit Product" : "Create Product"}</h2>

      {/* Basic Information */}
      <div className="settings-section">
        <div className="section-header" onClick={() => toggleSection("basic")}>
          <h3>Basic Information</h3>
          <span>{openSection.basic ? "-" : "+"}</span>
        </div>

        {openSection.basic && (
          <div className="section-body">
            <div className="settings-item">
              <label>Name</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
              />
            </div>

            <div className="settings-item">
              <label>Description</label>
              <textarea
                value={product.description || ""}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
              />
            </div>

            <div className="settings-item">
              <label>Category</label>
              <select
                value={product.category || ""}
                onChange={(e) =>
                  setProduct({ ...product, category: e.target.value })
                }
              >
                <option value="">Select category</option>
                {categoryOptions.map((c) => (
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
                value={product.price}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="settings-item">
              <label>Image</label>
              <input type="file" onChange={handleImageUpload} />
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt="Preview"
                  className="image-preview"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="settings-section">
        <div
          className="section-header"
          onClick={() => toggleSection("inventory")}
        >
          <h3>Inventory</h3>
          <span>{openSection.inventory ? "-" : "+"}</span>
        </div>

        {openSection.inventory && (
          <div className="section-body">
            <div className="settings-item">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                value={product.stock}
                onChange={(e) =>
                  setProduct({ ...product, stock: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Delivery */}
      <div className="settings-section">
        <div
          className="section-header"
          onClick={() => toggleSection("delivery")}
        >
          <h3>Delivery</h3>
          <span>{openSection.delivery ? "-" : "+"}</span>
        </div>

        {openSection.delivery && (
          <div className="section-body">
            <div className="settings-item">
              <label>Delivery Date</label>
              <input
                type="date"
                value={
                  product.delivery_date
                    ? product.delivery_date.substring(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setProduct({ ...product, delivery_date: e.target.value })
                }
              />
            </div>

            <div className="settings-item">
              <label>Delivery Time</label>
              <select
                value={product.delivery_time_label || ""}
                onChange={(e) => {
                  const label = e.target.value;
                  const time = parseFirstTime(label)?.toISOString() || null;

                  setProduct({
                    ...product,
                    delivery_time: time,
                    delivery_time_label: label,
                  });
                }}
              >
                <option value="">Select time slot</option>
                {deliveryTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cross Community Delivery */}
      <div className="settings-section">
        <div
          className="section-header"
          onClick={() => toggleSection("crossDelivery")}
        >
          <h3>Cross Community Delivery</h3>
          <span>{openSection.crossDelivery ? "-" : "+"}</span>
        </div>

        {openSection.crossDelivery && (
          <div className="section-body">
            <div className="settings-item toggle-row">
              <label>{communityText}</label>
              <input
                type="checkbox"
                checked={product.cross_comm_delivery}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    cross_comm_delivery: e.target.checked,
                  })
                }
              />
            </div>

            <div className="settings-item">
              <label>Cross Community Charge</label>
              <input
                type="number"
                value={product.cross_comm_charge}
                disabled={!product.cross_comm_delivery}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    cross_comm_charge: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Save + Delete Buttons */}
      <div className="settings-actions">
        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>

        {id && (
          <button className="delete-btn" onClick={handleDelete}>
            Delete Product
          </button>
        )}
      </div>
    </div>
  );
}
