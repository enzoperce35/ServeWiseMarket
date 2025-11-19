// src/components/auth/LoginModal.jsx
import React, { useState } from "react";
import { useAuthContext } from "../../context/AuthProvider";
import "../../css/components/AuthModal.css";

export default function LoginModal({ onClose }) {
  const { login } = useAuthContext();

  const [form, setForm] = useState({
    contact_number: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-modal">
        <h3>Login</h3>

        <form onSubmit={handleSubmit}>
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

          <button className="auth-btn-primary" type="submit">
            Login
          </button>
        </form>

        <button className="auth-close" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}
