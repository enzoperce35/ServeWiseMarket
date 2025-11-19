import { useState } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import "../css/pages/Auth.css"

export default function SignupPage() {
  const { handleSignup } = useAuthContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    contact_number: "",
    password: "",
    password_confirmation: "",
    district: "",
    subphase: "",
    street: "",
    block: "",
    lot: "",
    role: "buyer"
  });

  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]); // clear previous errors

    const res = await handleSignup(form);

    if (res.status === "ok") {
      navigate("/");
    } else {
      setErrors(res.errors || ["Signup failed"]);
    }
  };

  return (
    <div className="auth-page">
      <h2>Signup</h2>

      {/* Display errors */}
      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((err, idx) => (
            <div key={idx} className="error-message">{err}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Contact Number"
          value={form.contact_number}
          onChange={(e) =>
            setForm({ ...form, contact_number: e.target.value })
          }
        />

        <select
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
        >
          <option value="">Select District</option>
          <option value="Sampaguita Homes">Sampaguita Homes</option>
          <option value="Sampaguita West">Sampaguita West</option>
        </select>

        <select
          value={form.subphase}
          onChange={(e) => setForm({ ...form, subphase: e.target.value })}
        >
          <option value="">Select Subphase</option>
          <option value="Phase 1">Phase 1</option>
          <option value="Phase 2">Phase 2</option>
          <option value="Phase 3">Phase 3</option>
        </select>

        <input
          type="text"
          placeholder="Street"
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
        />

        <input
          type="text"
          placeholder="Block"
          value={form.block}
          onChange={(e) => setForm({ ...form, block: e.target.value })}
        />

        <input
          type="text"
          placeholder="Lot"
          value={form.lot}
          onChange={(e) => setForm({ ...form, lot: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.password_confirmation}
          onChange={(e) =>
            setForm({ ...form, password_confirmation: e.target.value })
          }
        />

        <button type="submit">Signup</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
