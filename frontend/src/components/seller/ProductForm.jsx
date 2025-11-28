// src/components/seller/ProductForm.jsx
import React, { useState, useEffect } from "react";
import "../../css/components/seller/ProductForm.css";

const CATEGORY_OPTIONS = [
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

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        price: product.price || "",
        category: product.category || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on change
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required.";
    if (!form.price && form.price !== 0) newErrors.price = "Price is required.";
    else if (form.price < 0) newErrors.price = "Price cannot be negative.";
    if (!form.category) newErrors.category = "Category is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="seller-product-form">
      {/* Product Name */}
      <div className="form-group">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="seller-input"
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>

      {/* Price */}
      <div className="form-group">
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          min="0"
          step="0.01"
          className="seller-input"
        />
        {errors.price && <p className="error-message">{errors.price}</p>}
      </div>

      {/* Category */}
      <div className="form-group">
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="seller-input"
        >
          <option value="" disabled>
            Select Category
          </option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="error-message">{errors.category}</p>}
      </div>

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
