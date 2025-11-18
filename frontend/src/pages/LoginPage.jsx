import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import "../css/pages/Auth.css";

export default function LoginPage() {
  const { login } = useAuthContext();
  const [form, setForm] = useState({
    contact_number: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(form);

    if (!res.success) {
      setError(res.message || "Login failed.");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="auth-container">
      <h1>Welcome Back</h1>

      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          name="contact_number"
          placeholder="Contact Number"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button className="btn-primary">Login</button>
      </form>
    </div>
  );
}
