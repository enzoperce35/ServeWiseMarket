// src/components/auth/SignupModal.jsx
import React, { useState } from "react";
import { useAuthContext } from "../../context/AuthProvider";
import "../../css/components/AuthModal.css";

export default function SignupModal({ onClose }) {
  const { signup } = useAuthContext();

  const [form, setForm] = useState({
    name: "",
    contact_number: "",
    password: "",
    password_confirmation: "",
    role: "buyer"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(form);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-modal">
        <h3>Sign Up</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Contact Number"
            value={form.contact_number}
            onChange={(e) =>
              setForm({ ...form, contact_number: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.password_confirmation}
            onChange={(e) =>
              setForm({ ...form, password_confirmation: e.target.value })
            }
          />

          <button className="auth-btn-primary" type="submit">
            Create Account
          </button>
        </form>

        <button className="auth-close" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}
