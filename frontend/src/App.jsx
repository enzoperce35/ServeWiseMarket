import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import Navbar from "./components/Navbar";
import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CreateShop from "./pages/seller/CreateShop";
import ProductFormPage from "./pages/seller/ProductFormPage";


// Seller pages
import Products from "./pages/seller/Products";
import ShopPage from "./pages/seller/ShopPage";

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
          <Route path="/seller/products/new" element={<ProductFormPage />} />
          <Route path="/seller/products/:id/edit" element={<ProductFormPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
