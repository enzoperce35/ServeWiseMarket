import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useProducts from "../../hooks/seller/useProducts";
import { useAuthContext } from "../../context/AuthProvider";
import { useIsMobileOrTablet } from "../../hooks/useDevice";

import SellerCard from "../../components/seller/SellerCard";
import SellerNavbar from "../../components/seller/SellerNavbar";

import { updateProduct } from "../../api/seller/products";
import {
  isExpired,
  getDeliveryDateTime,
  getDeliveryLabel,
} from "../../utils/deliveryDateTime";

import "../../css/seller/products.css";

export default function Products() {
  const { products, loading: productsLoading, setProducts } = useProducts();
  const { user, loading: userLoading } = useAuthContext();
  const navigate = useNavigate();
  const expiredCheckDone = useRef(false);

  // ============================================================
  // 📱 DEVICE DETECTION
  // ============================================================
  const isMobileOrTablet = useIsMobileOrTablet();

  // ============================================================
  // ⭐ EXPIRED CHECK
  // ============================================================
  useEffect(() => {
    if (!products || products.length === 0) return;
    if (expiredCheckDone.current) return;
    expiredCheckDone.current = true;

    const checkAndUpdateExpired = async () => {
      for (const product of products) {
        if (!isExpired(product)) continue;

        const daysToAdd = (product.delivery_gap ?? 0) + 1;
        const newDeliveryDate = getDeliveryDateTime(product, daysToAdd);
        const currentDelivery = getDeliveryDateTime(product);

        if (
          newDeliveryDate &&
          currentDelivery &&
          newDeliveryDate.getTime() === currentDelivery.getTime()
        )
          continue;

        try {
          const updatedProduct = await updateProduct(product.id, {
            delivery_date: newDeliveryDate.toLocaleDateString("en-CA"),
            status: false,
          });

          setProducts((prev) =>
            prev.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            )
          );
        } catch (err) {
          console.error("Failed to update expired product:", err);
        }
      }
    };

    checkAndUpdateExpired();
  }, [products, setProducts]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleEdit = (product) =>
    navigate(`/seller/products/${product.id}/edit`);

  const handleCreate = () => navigate("/seller/products/new");

  const handleStatusToggle = async (product) => {
    try {
      const updatedProduct = await updateProduct(product.id, {
        status: !product.status,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === updatedProduct.id ? updatedProduct : p
        )
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // ============================================================
  // MOBILE/TABLET: SHOW INACTIVE TOGGLE STATE
  // ============================================================
  const [showInactive, setShowInactive] = useState({});

  useEffect(() => {
    if (!products || products.length === 0) return;

    const initialState = {};
    products.forEach((product) => {
      const label = getDeliveryLabel(product) || "Other";
      initialState[label] = false; // inactive hidden by default
    });
    setShowInactive(initialState);
  }, [products]);

  const toggleInactive = (label) => {
    setShowInactive((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  if (productsLoading || userLoading) {
    return <p>Loading products...</p>;
  }

  // ============================================================
  // DESKTOP SORT
  // ============================================================
  const sortedProducts = [...products].sort((a, b) => {
    if (a.status !== b.status) return a.status ? -1 : 1;
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  // ============================================================
  // MOBILE/TABLET GROUPING
  // ============================================================
  let groupedByDelivery = {};
  let groupOrder = [];

  if (isMobileOrTablet) {
    products.forEach((product) => {
      const label = getDeliveryLabel(product) || "Other";
      if (!groupedByDelivery[label]) {
        groupedByDelivery[label] = [];
        groupOrder.push(label);
      }
      groupedByDelivery[label].push(product);
    });
  }

  return (
    <div className="seller-page">
      <SellerNavbar />

      <div className="p-4">
        {products.length === 0 ? (
          <div className="no-products-message">
            <p>
              You have no products yet. Click the button below to create
              your first product!
            </p>
            <button
              className="add-product-button"
              onClick={handleCreate}
            >
              + Create Product
            </button>
          </div>
        ) : (
          <>
            {isMobileOrTablet ? (
              <div className="seller-mobile-groups">
                {groupOrder.map((label) => {
                  const allItems = groupedByDelivery[label];
                  const activeItems = allItems.filter(
                    (p) => p.status
                  );
                  const inactiveItems = allItems.filter(
                    (p) => !p.status
                  );
                  const showInactiveItems = showInactive[label];

                  return (
                    <div key={label} className="delivery-group">
                      {/* GROUP HEADER */}
                      <div
                        className="delivery-group-header"
                        onClick={() =>
                          inactiveItems.length > 0 &&
                          toggleInactive(label)
                        }
                      >
                        <span className="delivery-group-title">
                          {label}
                        </span>

                        {inactiveItems.length > 0 && (
                          <span className="group-toggle-arrow">
                            {showInactiveItems
                              ? `▼`
                              : `▶`}
                          </span>
                        )}
                      </div>

                      {/* PRODUCTS */}
                      <div className="seller-product-grid">
                        {/* ACTIVE (always visible) */}
                        {activeItems.map((product) => (
                          <SellerCard
                            key={product.id}
                            product={product}
                            user={user}
                            isMobile={isMobileOrTablet}
                            onClick={() =>
                              handleEdit(product)
                            }
                            onStatusClick={() =>
                              handleStatusToggle(product)
                            }
                          />
                        ))}

                        {/* INACTIVE (toggleable) */}
                        {showInactiveItems &&
                          inactiveItems.map((product) => (
                            <SellerCard
                              key={product.id}
                              product={product}
                              user={user}
                              isMobile={isMobileOrTablet}
                              onClick={() =>
                                handleEdit(product)
                              }
                              onStatusClick={() =>
                                handleStatusToggle(product)
                              }
                            />
                          ))}
                      </div>
                    </div>
                  );
                })}

                <button
                  className="add-product-circle"
                  onClick={handleCreate}
                >
                  +
                </button>
              </div>
            ) : (
              <div className="seller-product-grid">
                {sortedProducts.map((product) => (
                  <SellerCard
                    key={product.id}
                    product={product}
                    user={user}
                    isMobile={false}
                    onClick={() =>
                      handleEdit(product)
                    }
                    onStatusClick={() =>
                      handleStatusToggle(product)
                    }
                  />
                ))}

                <button
                  className="add-product-circle"
                  onClick={handleCreate}
                >
                  +
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
