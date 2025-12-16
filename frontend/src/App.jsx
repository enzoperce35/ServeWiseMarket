import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CreateShop from "./pages/seller/CreateShop";
import ProductFormPage from "./pages/seller/ProductFormPage";
import ProductSettingsPage from "./pages/seller/ProductSettingsPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";


// Seller pages
import Products from "./pages/seller/Products";
import ShopPage from "./pages/seller/ShopPage";
import OrdersPage from "./pages/OrdersPage";

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
          <Route path="/shop/:shopId" element={<ShopPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/seller/products/new" element={<ProductFormPage />} />
          <Route path="/seller/products/:id/edit" element={<ProductSettingsPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} /> {/* ✅ Add this */}

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
