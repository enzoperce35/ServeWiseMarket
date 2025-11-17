// src/App.jsx
import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./css/main.css";

export default function App() {
  return <RouterProvider router={router} />;
}
