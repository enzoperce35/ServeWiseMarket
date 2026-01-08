import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSellerProducts } from "../../../api/seller/products";
import "../../../css/pages/seller/SellerPages/SellerProductsPage.css";

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const prods = await fetchSellerProducts();

      prods.sort((a, b) => a.name.localeCompare(b.name)); // alphabetical

      setProducts(prods);
      setLoading(false);
    };

    loadProducts();
  }, []);

  const toggleProductActive = async (product, targetActive) => {
    try {
      const token = localStorage.getItem("token");

      if (
        !product.product_delivery_groups ||
        product.product_delivery_groups.length === 0
      )
        return;

      const updatedGroups = await Promise.all(
        product.product_delivery_groups.map(async (pdg) => {
          if (pdg.active === targetActive) return pdg;

          const url = `/api/v1/product_delivery_groups/${pdg.id}/${
            targetActive ? "activate" : "deactivate"
          }`;

          const res = await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("Failed to toggle product group state");

          const data = await res.json();
          return data?.product_delivery_group;
        })
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, product_delivery_groups: updatedGroups }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      alert(`Error toggling product: ${err.message}`);
    }
  };

  const handleCreate = () => navigate("/seller/products/new");

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="seller-products-page">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span></span>

        {/* ✅ Green create button (same style concept as Groups page) */}
        <button
          onClick={handleCreate}
          className="add-product-circle"
          title="Create new product"
        >
          +
        </button>
      </div>

      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Stock</th>
            <th>Active</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const groups = product.product_delivery_groups || [];
            const isActive = groups.some((dg) => dg.active);

            return (
              <tr
                key={product.id}
                className="clickable-row"
                onClick={() =>
                  navigate(`/seller/products/${product.id}/edit`)
                }
              >
                <td>{product.name}</td>
                <td>{product.stock || 0}</td>

                <td onClick={(e) => e.stopPropagation()}>
                  {groups.length === 0 ? (
                    <span style={{ color: "red", fontSize: "0.9rem" }}>
                      No groups
                    </span>
                  ) : product.stock === 0 ? (
                    <span style={{ opacity: 0.5 }}>—</span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleProductActive(product, !isActive)}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
