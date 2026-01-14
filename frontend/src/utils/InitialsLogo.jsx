// components/InitialsLogo.jsx
import React from "react";

function getInitials(name) {
  return name
    .trim()
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function InitialsLogo({ name, size = 42 }) {
  if (!name) return null;

  const initials = getInitials(name);

  return (
    <div
      style={logoContainer(size)}
      className="flex items-center justify-center font-semibold shadow-md"
    >
      <span style={logoText(size)}>{initials}</span>
    </div>
  );
}

/* ===========================
   Styles (separated section)
=========================== */

const logoContainer = (size) => ({
  width: size,
  height: size,
  borderRadius: "9999px",
  backgroundColor: "#f59e0b", // amber-500
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const logoText = (size) => ({
  color: "white",
  fontSize: size * 0.4,
  letterSpacing: "0.05em",
});
