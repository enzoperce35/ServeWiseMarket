import { useState } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import "../css/pages/Auth.css";

export default function SignupPage() {
  const { handleSignup } = useAuthContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    contact_number: "",
    password: "",
    password_confirmation: "",
    address: "",
    messenger_url: ""
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = {};

    // Frontend validation
    if (!form.name.trim()) fieldErrors.name = "Name is required";
    if (!form.contact_number.trim()) fieldErrors.contact_number = "Contact number is required";
    if (!form.address.trim()) fieldErrors.address = "Address is required";

    if (!form.password) fieldErrors.password = "Password is required";
    else if (form.password.length < 6) fieldErrors.password = "Password must be at least 6 characters";

    if (form.password !== form.password_confirmation)
      fieldErrors.password_confirmation = "Passwords do not match";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return; // stop submission if errors
    }

    // Call API
    const res = await handleSignup(form);
    if (res.status === "ok") {
      navigate("/"); // Redirect after successful signup
    } else {
      const apiErrors = {};
      (res.errors || []).forEach(err => {
        apiErrors.general = err;
      });
      setErrors(apiErrors);
    }
  };

  const renderError = (field) => errors[field] ? <div className="error-message">{errors[field]}</div> : null;

  return (
    <div className="auth-page">
      <h2>Signup</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {renderError("name")}
        </label>

        <label>
          Contact Number
          <input
            type="text"
            value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
          />
          {renderError("contact_number")}
        </label>

        <label>
          Address
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          {renderError("address")}
        </label>

        <label>
          Messenger URL (optional)
          <input
            type="text"
            placeholder="e.g., https://m.me/username"
            value={form.messenger_url}
            onChange={(e) => setForm({ ...form, messenger_url: e.target.value })}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {renderError("password")}
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          />
          {renderError("password_confirmation")}
        </label>

        {renderError("general")}

        <button type="submit">Signup</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
