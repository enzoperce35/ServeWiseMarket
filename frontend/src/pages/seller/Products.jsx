import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useProducts from "../../hooks/seller/useProducts";
import { useAuthContext } from "../../context/AuthProvider";
import SellerCard from "../../components/seller/SellerCard";
import { updateProduct } from "../../api/seller/products";
import SellerNavbar from "../../components/seller/SellerNavbar";
import { isExpired, getDeliveryDateTime } from "../../utils/deliveryDateTime";
import "../../css/seller/seller.css";

export default function Products() {
  const { products, loading: productsLoading, setProducts } = useProducts();
  const { user, loading: userLoading } = useAuthContext();
  const navigate = useNavigate();

  const expiredCheckDone = useRef(false);

  // ============================================================
  // ⭐ EXPIRED CHECK — now using combined date + time
  // ============================================================
  useEffect(() => {
    if (!products || products.length === 0) return;
    if (expiredCheckDone.current) return;

    expiredCheckDone.current = true;

    const checkAndUpdateExpired = async () => {
      for (const product of products) {

        if (!isExpired(product)) continue;

        const daysToAdd = (product.delivery_gap ?? 0) + 1;

        // ⭐ NEW: get next delivery date INCLUDING same time
        const newDeliveryDate = getDeliveryDateTime(product, daysToAdd);

        const currentDelivery = getDeliveryDateTime(product);

        // 🚫 Prevent redundant update if same date/time
        if (newDeliveryDate.getTime() === currentDelivery.getTime()) {
          continue;
        }
        
        const updatedProductData = {
          delivery_date: newDeliveryDate.toLocaleDateString("en-CA"),
          status: false,
        };

        try {
          const updatedProduct = await updateProduct(product.id, updatedProductData);

          setProducts((prev) =>
            prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
          );
        } catch (err) {
          console.error("Failed to update expired product:", err);
        }
      }
    };

    checkAndUpdateExpired();
  }, [products, setProducts]);

  const handleEdit = (product) => navigate(`/seller/products/${product.id}/edit`);
  const handleCreate = () => navigate("/seller/products/new");

  const handleStatusToggle = async (product) => {
    const newStatus = !product.status;

    try {
      const updatedProduct = await updateProduct(product.id, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  if (productsLoading || userLoading) {
    return <p>Loading products...</p>;
  }

  // ============================================================
  // ⭐ SORTING LOGIC (unchanged)
  // ============================================================
  const sortedProducts = [...products].sort((a, b) => {
    if (a.status !== b.status) return a.status ? -1 : 1;

    if (a.status && b.status) {
      if (!a.preorder_delivery && !b.preorder_delivery) {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }

      if (a.preorder_delivery && b.preorder_delivery) {
        return new Date(a.delivery_time) - new Date(b.delivery_time);
      }

      if (!a.preorder_delivery && b.preorder_delivery) return -1;
      if (a.preorder_delivery && !b.preorder_delivery) return 1;
    }

    if (!a.status && !b.status) {
      return new Date(b.updated_at) - new Date(a.updated_at);
    }

    return 0;
  });

  return (
    <div className="seller-page">
      <SellerNavbar />

      <div className="p-4">
        {sortedProducts.length === 0 ? (
          <div className="no-products-message">
            <p>You have no products yet. Click the button below to create your first product!</p>
            <button className="add-product-button" onClick={handleCreate}>
              + Create Product
            </button>
          </div>
        ) : (
          <div className="seller-product-grid">
            {sortedProducts.map((product) => (
              <SellerCard
                key={product.id}
                product={product}
                user={user}
                onClick={() => handleEdit(product)}
                onStatusClick={() => handleStatusToggle(product)}
              />
            ))}

            <button className="add-product-circle" onClick={handleCreate}>
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
