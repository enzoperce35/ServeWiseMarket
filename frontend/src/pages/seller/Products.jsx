import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthProvider";
import useProducts from "../../hooks/seller/useProducts";
import ProductCard from "../../components/seller/ProductCard";
import ProductForm from "../../components/seller/ProductForm";
import { createProduct, updateProduct, deleteProduct } from "../../api/seller/products";
import { fetchShop } from "../../api/seller/shops"; // make sure you have this API
import "../../css/seller/seller.css";

export default function Products() {
  const { user } = useAuthContext();
  const { products, reload } = useProducts();
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const loadShop = async () => {
      const existingShop = await fetchShop();
      setShop(existingShop);
    };
    loadShop();
  }, []);

  if (!user || !shop) return <p>Loading...</p>; // wait until shop is loaded

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      reload();
    }
  };

  const handleSave = async (productData) => {
    try {
      const payload = { ...productData, shop_id: shop.id }; // include shop_id
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setShowForm(false);
      setEditingProduct(null);
      reload();
    } catch (err) {
      console.error("Error creating/updating product:", err);
    }
  };

  return (
    <div className="p-4">
      <button
        className="seller-btn seller-btn-success mb-4"
        onClick={() => setShowForm(true)}
      >
        Add Product
      </button>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}

      <div className="seller-product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
