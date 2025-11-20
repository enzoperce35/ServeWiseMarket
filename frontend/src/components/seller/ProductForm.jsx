// src/components/seller/ProductForm.jsx
import React, { useState, useEffect } from "react";
import "../../css/components/seller/ProductForm.css";

const DEFAULT_IMAGE = "https://via.placeholder.com/300x200.png?text=Product+Image";

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    image_url: "",
    stock: 0,
    availability_type: "on_hand",
    preorder_lead_time_hours: 0,
    next_available_date: null,
    max_orders_per_day: 0,
    status: "active",
    featured: false,
  });

  useEffect(() => {
    if (product) {
      setForm({
        ...form,
        ...product,
        image_url: product.image_url || DEFAULT_IMAGE,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ensure defaults
    const payload = {
      ...form,
      description: form.description || "",
      stock: form.stock || 0,
      image_url: form.image_url || DEFAULT_IMAGE,
      availability_type: form.availability_type || "on_hand",
      preorder_lead_time_hours: form.preorder_lead_time_hours || 0,
      next_available_date: form.next_available_date || null,
      max_orders_per_day: form.max_orders_per_day || 0,
      status: form.status || "active",
      featured: form.featured || false,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="seller-product-form">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Product Name"
        required
        className="seller-input"
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Product Description"
        className="seller-input"
      />

      <input
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
        min="0"
        step="0.01"
        className="seller-input"
        required
      />

      <input
        type="text"
        name="category"
        value={form.category}
        onChange={handleChange}
        placeholder="Category"
        className="seller-input"
        required
      />

      <input
        type="text"
        name="image_url"
        value={form.image_url}
        onChange={handleChange}
        placeholder="Image URL"
        className="seller-input"
      />

      <div className="flex space-x-2 mt-2">
        <button type="submit" className="seller-btn seller-btn-primary">
          Save
        </button>
        <button type="button" className="seller-btn seller-btn-gray" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
