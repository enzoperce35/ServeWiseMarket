// src/pages/seller/ProductFormPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSellerProducts, createProduct, updateProduct } from "../../api/seller/products";
import { fetchShop } from "../../api/seller/shops";
import ProductForm from "../../components/seller/ProductForm";

export default function ProductFormPage() {
  const { id } = useParams(); // product ID for editing
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const s = await fetchShop();
      setShop(s);

      if (id) {
        const products = await fetchSellerProducts();
        const p = products.find((prod) => prod.id === parseInt(id));
        setProduct(p || null);
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  const handleSave = async (productData) => {
    try {
      let payload = { ...productData, shop_id: shop.id };

      // ---------------------------
      // ONLY SET ON CREATE (no product yet)
      // ---------------------------
      if (!product) {
        const now = new Date();
        now.setHours(20, 0, 0, 0); // 8:00 PM today

        const delivery_date = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const delivery_time = now.toISOString(); // full ISO timestamp

        payload.delivery_date = delivery_date;
        payload.delivery_time = delivery_time;
      }

      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }

      navigate("/seller/products");
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  return (
    <div className="p-4 seller-page">
      <h2>{product ? "Edit Product" : "Create Product"}</h2>
      <ProductForm
        product={product}
        onSave={handleSave}
        onCancel={() => navigate("/seller/products")}
      />
    </div>
  );
}
