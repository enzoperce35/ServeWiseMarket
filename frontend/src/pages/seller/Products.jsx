import React from "react";
import { useNavigate } from "react-router-dom";
import useProducts from "../../hooks/seller/useProducts";
import { useAuthContext } from "../../context/AuthProvider"; // ✅ use context
import SellerCard from "../../components/seller/SellerCard";
import { updateProduct } from "../../api/seller/products";
import SellerNavbar from "../../components/seller/SellerNavbar"; // ✅ add this
import "../../css/seller/seller.css";

export default function Products() {
  const { products, loading: productsLoading, setProducts } = useProducts();
  const { user, loading: userLoading } = useAuthContext(); // ✅ shared user
  const navigate = useNavigate();

  // Wait until both products and user are loaded
  if (productsLoading || userLoading) return <p>Loading products...</p>;

  const handleEdit = (product) => {
    navigate(`/seller/products/${product.id}/edit`);
  };

  const handleCreate = () => {
    navigate("/seller/products/new");
  };

  const handleStatusToggle = async (product) => {
    const newStatus = !product.status;

    try {
      // update backend
      const updatedProduct = await updateProduct(product.id, { status: newStatus });

      // update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
  <div className="seller-page">
    <SellerNavbar />  {/* ✅ navbar added */}

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
