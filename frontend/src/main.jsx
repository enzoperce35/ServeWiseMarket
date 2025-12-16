import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartProvider";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        {/* 🔔 Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000,
          }}
        />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
