import { useState } from "react";
import useAuth from "../hooks/useAuth";

export default function SignupPage() {
  const { handleSignup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    contact_number: "",
    password: "",
    password_confirmation: "",
    role: "buyer",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await handleSignup(form);
      console.log("Signup success!", data);
      alert("Signup successful!");
    } catch (err) {
      console.error(err);
      alert("Signup failed!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="contact_number" placeholder="Contact Number" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <input type="password" name="password_confirmation" placeholder="Confirm Password" onChange={handleChange} />

      <select name="role" onChange={handleChange}>
        <option value="buyer">Buyer</option>
        <option value="seller">Seller</option>
      </select>

      <button type="submit">Sign Up</button>
    </form>
  );
}
