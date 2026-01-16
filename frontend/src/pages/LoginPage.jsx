import { useState } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import "../css/pages/LoginPage.css";

export default function LoginPage() {
  const { handleLogin } = useAuthContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ contact_number: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await handleLogin(form);

      if (res.status === "ok") {
        // ✅ Check if the user has a shop
        const shopId = res.user?.shop?.id;

        if (shopId) {
          // Redirect to the user's shop products page
          navigate(`/products?shop_id=${shopId}`);
        } else {
          // Fallback: go to general landing page
          navigate("/products");
        }
      } else {
        setError(res.errors?.[0] || "Login failed");
      }
    } catch (err) {
      setError("Unexpected error during login");
      console.error(err);
    } finally {
      setLoading(false);
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
          onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        Don’t have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}
