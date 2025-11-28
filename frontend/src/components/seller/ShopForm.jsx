import { useState } from "react";
import { useAuthContext } from "../../context/AuthProvider";
import "../../css/pages/seller/ShopForm.css";

export default function ShopForm({ shop, onSave, onCancel }) {
  const { user } = useAuthContext();

  const [form, setForm] = useState({
    name: shop?.name || "",
    description: shop?.description || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // clear error as user types
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Shop name is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    onSave(form); // call save if no errors
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
        className={errors.name ? "input-error" : ""}
      />
      {errors.name && <p className="error-text">{errors.name}</p>}

      <textarea
        name="description"
        placeholder="Shop Description"
        value={form.description}
        onChange={handleChange}
        className={errors.description ? "input-error" : ""}
      />
      {errors.description && (
        <p className="error-text">{errors.description}</p>
      )}

      <div className="form-buttons">
        <button type="submit" className="btn-save">
          {shop ? "Update Shop" : "Create Shop"}
        </button>

        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
