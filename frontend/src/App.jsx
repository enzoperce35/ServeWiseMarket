import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CreateShop from "./pages/seller/CreateShop";
import ProductFormPage from "./pages/seller/ProductFormPage";
import ProductSettingsPage from "./pages/seller/ProductSettingsPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import EditSellerShopPage from "./components/seller/EditSellerShopPage";
import LandingPage from "./pages/LandingPage/LandingPage";


// Seller pages
//import Products from "./pages/seller/SellerPages/Products";
import SellerPages from "./pages/seller/SellerPages/SellerPages";
import ShopPage from "./pages/seller/ShopPage";
import OrdersPage from "./pages/OrdersPage";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Buyer pages */}
     
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Seller pages */}
        <Route path="/seller/create-shop" element={<CreateShop />} />
        {/* <Route path="/seller/products" element={<Products />} />*/}
        <Route path="/seller/products" element={<SellerPages />} />
        <Route path="/shop/:shopId" element={<ShopPage />} />
        <Route path="/shops/:shopId" element={<ShopPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/seller/products/new" element={<ProductFormPage />} />
        <Route path="/seller/products/:id/edit" element={<ProductSettingsPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} /> {/* ✅ Add this */}
        <Route path="/shops/:shopId/edit" element={<EditSellerShopPage />} />
        <Route path="/seller/orders" element={<SellerOrdersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
