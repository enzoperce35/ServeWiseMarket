import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CreateShop from "./pages/seller/CreateShop";
import ProductFormPage from "./pages/seller/ProductFormPage";
import ProductSettingsPage from "./pages/seller/ProductSettingsPage";

// Seller pages
import Products from "./pages/seller/Products";
import ShopPage from "./pages/seller/ShopPage";
import OrdersPage from "./pages/seller/OrdersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Buyer pages */}
          <Route path="/" element={<ProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Seller pages */}
          <Route path="/seller/create-shop" element={<CreateShop />} />
          <Route path="/seller/products" element={<Products />} />
          <Route path="/seller/shop" element={<ShopPage />} />
          <Route path="/seller/orders" element={<OrdersPage />} />
          <Route path="/seller/products/new" element={<ProductFormPage />} />
          <Route path="/seller/products/:id/edit" element={<ProductSettingsPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
