import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartProvider";
import { OrdersProvider } from "./context/OrdersProvider";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <App />
            {/* 🔔 Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 2000,
              }}
            />
         </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
