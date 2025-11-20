// src/pages/seller/ShopForm.jsx
import { useState } from "react";
import { useAuthContext } from "../../context/AuthProvider";
import "../../css/pages/seller/ShopForm.css"

export default function ShopForm({ shop, onSave, onCancel }) {
  const { user } = useAuthContext();

  const [form, setForm] = useState({
    name: shop?.name || "",
    description: shop?.description || "",
    image_url: shop?.image_url || ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);   // <-- FIXED
  };

  return (
    <form onSubmit={handleSubmit} className="shop-form">
      <h2>{shop ? "Edit Shop" : "Create Your Shop"}</h2>
      <p>Welcome {user?.name}! 👋</p>

      <input
        name="name"
        placeholder="Shop Name"
        value={form.name}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Shop Description"
        value={form.description}
        onChange={handleChange}
      />

      <input
        name="image_url"
        placeholder="Cover Image URL"
        value={form.image_url}
        onChange={handleChange}
      />

      <div className="form-buttons">
        <button type="submit" className="btn-save">
          {shop ? "Update Shop" : "Create Shop"}
        </button>

        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
