import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useProducts from "../../hooks/seller/useProducts";
import { useAuthContext } from "../../context/AuthProvider";
import SellerCard from "../../components/seller/SellerCard";
import { updateProduct } from "../../api/seller/products";
import SellerNavbar from "../../components/seller/SellerNavbar";
import "../../css/seller/seller.css";

export default function Products() {
  const { products, loading: productsLoading, setProducts } = useProducts();
  const { user, loading: userLoading } = useAuthContext();
  const navigate = useNavigate();

  // Helper: check if a product is expired (robust ISO time parsing)
  const isExpired = (product) => {
    if (!product.preorder_delivery) return false;

    const now = new Date();

    // Parse delivery_date as date-only
    const [year, month, day] = product.delivery_date
      .split("T")[0]
      .split("-")
      .map(Number);

    // Default time
    let hours = 0,
      minutes = 0,
      seconds = 0;

    // Parse delivery_time (supports ISO or HH:MM:SS)
    if (product.delivery_time) {
      const timeDate = new Date(product.delivery_time);
      hours = timeDate.getHours();
      minutes = timeDate.getMinutes();
      seconds = timeDate.getSeconds();
    }

    // Combine date + time into local datetime
    const combined = new Date(year, month - 1, day, hours, minutes, seconds);

    return now > combined;
  };

  // Effect: check and update expired products
  useEffect(() => {
    const checkAndUpdateExpired = async () => {
      if (!products || products.length === 0) return;

      for (const product of products) {
        if (!isExpired(product)) continue;

        // Calculate new delivery_date: today + (delivery_gap + 1)
        const daysToAdd = (product.delivery_gap ?? 0) + 1;
        const newDeliveryDate = new Date();
        newDeliveryDate.setDate(newDeliveryDate.getDate() + daysToAdd);

        const updatedProductData = {
          delivery_date: newDeliveryDate.toISOString(),
          status: false, // automatically mark as inactive
          // delivery_time stays unchanged
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

  // Navigation handlers
  const handleEdit = (product) => {
    navigate(`/seller/products/${product.id}/edit`);
  };

  const handleCreate = () => {
    navigate("/seller/products/new");
  };

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

  // Conditional rendering
  if (productsLoading || userLoading) {
    return <p>Loading products...</p>;
  }

  return (
    <div className="seller-page">
      <SellerNavbar />

      <div className="p-4">
        {products.length === 0 ? (
          <div className="no-products-message">
            <p>You have no products yet. Click the button below to create your first product!</p>
            <button className="add-product-button" onClick={handleCreate}>
              + Create Product
            </button>
          </div>
        ) : (
          <div className="seller-product-grid">
            {products.map((product) => (
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
