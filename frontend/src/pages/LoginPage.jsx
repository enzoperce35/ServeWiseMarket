import { useState } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import "../css/pages/LoginPage.css";

export default function LoginPage() {
  const { handleLogin } = useAuthContext(); // use handleLogin, not login
  const navigate = useNavigate();

  const [form, setForm] = useState({
    contact_number: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await handleLogin(form);

    if (res.status === "ok") {
      navigate("/"); // redirect to main page
    } else {
      setError(res.errors?.[0] || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
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
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don’t have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}
