import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSellerProducts } from "../../../api/seller/products";
import "../../../css/pages/seller/SellerPages/SellerProductsPage.css";

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const prods = await fetchSellerProducts();
      prods.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(prods);
      setLoading(false);
    };
    loadProducts();
  }, []);

  // Toggle mother product active → all variants
  const toggleProductVariantsActive = async (product, targetActive) => {
    if (!product.variants || product.variants.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const updatedVariants = await Promise.all(
        product.variants.map(async (variant) => {
          if (variant.active === targetActive) return variant;

          const url = `/api/v1/seller/products/${product.id}/product_variants/${variant.id}`;
          const res = await fetch(url, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ product_variant: { active: targetActive } }),
          });
          if (!res.ok) throw new Error("Failed to toggle variant");
          const data = await res.json();
          return data;
        })
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, variants: updatedVariants } : p
        )
      );
    } catch (err) {
      console.error(err);
      alert(`Error toggling product variants: ${err.message}`);
    }
  };

  // Toggle individual variant
  const toggleVariantActive = async (productId, variant) => {
    try {
      const token = localStorage.getItem("token");
      const url = `/api/v1/seller/products/${productId}/product_variants/${variant.id}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_variant: { active: !variant.active } }),
      });
      if (!res.ok) throw new Error("Failed to toggle variant");
      const data = await res.json();

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                variants: p.variants.map((v) =>
                  v.id === variant.id ? data : v
                ),
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      alert(`Error toggling variant: ${err.message}`);
    }
  };

  // Toggle product_delivery_groups active for products without variants
  const toggleProductActive = async (product, targetActive) => {
    try {
      const token = localStorage.getItem("token");
      if (!product.product_delivery_groups || product.product_delivery_groups.length === 0) return;

      const updatedGroups = await Promise.all(
        product.product_delivery_groups.map(async (pdg) => {
          if (pdg.active === targetActive) return pdg;

          const url = `/api/v1/product_delivery_groups/${pdg.id}/${targetActive ? "activate" : "deactivate"}`;
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
  const toggleExpanded = (productId) =>
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));

  if (loading) return <p>Loading products...</p>;

  const productsWithVariants = products.filter((p) => p.variants?.length > 0);
  const productsWithoutVariants = products.filter((p) => !p.variants || p.variants.length === 0);

  return (
    <div className="seller-products-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span></span>
        <button onClick={handleCreate} className="add-product-circle" title="Create new product">+</button>
      </div>

      {/* PRODUCTS WITH VARIANTS */}
      {productsWithVariants.length > 0 && (
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Name</th>
                <th style={{ width: "60px" }}>Stock</th>
                <th style={{ width: "60px" }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {productsWithVariants.map((product) => {
                const anyVariantActive = product.variants.some((v) => v.active);
                return (
                  <React.Fragment key={product.id}>
                    <tr className="clickable-row" onClick={() => navigate(`/seller/products/${product.id}/edit`)}>
                      <td style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{product.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleExpanded(product.id); }}
                          style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "1rem" }}
                        >
                          {expandedProducts[product.id] ? "▼" : "▶"}
                        </button>
                      </td>
                      <td>{product.stock || 0}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={anyVariantActive} onChange={() => toggleProductVariantsActive(product, !anyVariantActive)} />
                      </td>
                    </tr>

                    {expandedProducts[product.id] && product.variants.map((variant) => (
                      <tr key={variant.id} className="clickable-row" style={{ backgroundColor: "#f9fafb" }}>
                        <td style={{ paddingLeft: "2rem" }}>{variant.name}</td>
                        <td></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={variant.active} onChange={() => toggleVariantActive(product.id, variant)} />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {/* PRODUCTS WITHOUT VARIANTS */}
      {productsWithoutVariants.length > 0 && (
        <>
          <table className="products-table">
            <thead className="products-without-variant">
              <tr>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productsWithoutVariants.map((product) => {
                const groups = product.product_delivery_groups || [];
                const isActive = groups.some((dg) => dg.active);
                return (
                  <tr key={product.id} className="clickable-row" onClick={() => navigate(`/seller/products/${product.id}/edit`)}>
                    <td>{product.name}</td>
                    <td>{product.stock || 0}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {groups.length === 0 ? <span style={{ opacity: 0.5 }}>—</span> :
                        <input type="checkbox" checked={isActive} onChange={() => toggleProductActive(product, !isActive)} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
