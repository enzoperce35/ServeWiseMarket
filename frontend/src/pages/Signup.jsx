// src/pages/Signup.jsx
import { useState } from "react";
import useAuth from "../hooks/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    contact_number: "",
    password: "",
    password_confirmation: "",
    role: "buyer",
    block: "",
    lot: "",
    street: "",
    district: "",
    subphase: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    await signup(form);
    alert("Account created!");
  };

  return (
    <div>
      <h1>Signup</h1>

      <form onSubmit={handleSignup}>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="contact_number" placeholder="Contact Number" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <input name="password_confirmation" type="password" placeholder="Confirm Password" onChange={handleChange} />

        <input name="block" placeholder="Block" onChange={handleChange} />
        <input name="lot" placeholder="Lot" onChange={handleChange} />
        <input name="street" placeholder="Street" onChange={handleChange} />

        <input name="district" placeholder="District" onChange={handleChange} />
        <input name="subphase" placeholder="Subphase" onChange={handleChange} />

        <button>Create Account</button>
      </form>
    </div>
  );
}
