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
    community: "",
    phase: "",
    street: "",
    block: "",
    lot: "",
    role: "buyer"
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = {};

    // Frontend validation
    if (!form.name.trim()) fieldErrors.name = "Name is required";
    if (!form.contact_number.trim()) fieldErrors.contact_number = "Contact number is required";

    if (!form.community) fieldErrors.community = "Community must be selected";
    if (!form.phase) fieldErrors.phase = "Phase must be selected";

    if (!form.street.trim()) fieldErrors.street = "Street is required";
    else if (form.street.length > 30) fieldErrors.street = "Street must be less than 30 characters";

    if (!form.block.trim()) fieldErrors.block = "Block is required";
    else if (!/^\d+$/.test(form.block)) fieldErrors.block = "Block must be numbers only";
    else if (form.block.length > 2) fieldErrors.block = "Block can be max 2 digits";

    if (!form.lot.trim()) fieldErrors.lot = "Lot is required";
    else if (!/^\d+$/.test(form.lot)) fieldErrors.lot = "Lot must be numbers only";
    else if (form.lot.length > 2) fieldErrors.lot = "Lot can be max 2 digits";

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

  // Helper for displaying inline error messages
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
          Community
          <select
            value={form.community}
            onChange={(e) => setForm({ ...form, community: e.target.value })}
          >
            <option value="">--Select Community--</option>
            <option value="Sampaguita West">Sampaguita West</option>
            <option value="Sampaguita Homes">Sampaguita Homes</option>
          </select>
          {renderError("community")}
        </label>

        <label>
          Phase
          <select
            value={form.phase}
            onChange={(e) => setForm({ ...form, phase: e.target.value })}
          >
            <option value="">--Select Phase--</option>
            <option value="Phase 1">Phase 1</option>
            <option value="Phase 2">Phase 2</option>
            <option value="Phase 3">Phase 3</option>
          </select>
          {renderError("phase")}
        </label>

        <label>
          Street
          <input
            type="text"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
          />
          {renderError("street")}
        </label>

        <label>
          Block
          <input
            type="text"
            value={form.block}
            onChange={(e) => setForm({ ...form, block: e.target.value })}
          />
          {renderError("block")}
        </label>

        <label>
          Lot
          <input
            type="text"
            value={form.lot}
            onChange={(e) => setForm({ ...form, lot: e.target.value })}
          />
          {renderError("lot")}
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
