import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import ProductCard from "../../components/ProductCard";
import { isExpired, getDeliveryLabel, getDeliveryDateTime } from "../../utils/deliveryDateTime";
import { useCartContext } from "../../context/CartProvider";
import { useOrdersContext } from "../../context/OrdersProvider";
import { useAuthContext } from "../../context/AuthProvider";
import { addToCartApi } from "../../api/cart";
import GlobalCartOrders from "../../components/common/GlobalCartOrders";
import BackButton from "../../components/common/BackButton";
import { isProductAvailable } from "../../utils/productAvailability";
import toast from "react-hot-toast";
import "../../css/components/seller/EditSellerShopPage.css";
import "../../css/components/seller/ShopPage.css";

export default function ShopPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const { cart, refreshCart } = useCartContext();
  const { ordersCount, refreshOrders } = useOrdersContext();
  const { user, token } = useAuthContext();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [animateCart, setAnimateCart] = useState(false);
  const [animateOrders, setAnimateOrders] = useState(false);

  const prevCartCountRef = useRef(cart?.item_count || 0);
  const prevOrdersCountRef = useRef(ordersCount || 0);

  useEffect(() => {
    refreshCart();
    refreshOrders();
  }, []);

  useEffect(() => {
    const currentCartCount = cart?.item_count || 0;
    if (currentCartCount > prevCartCountRef.current) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 350);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = currentCartCount;
  }, [cart?.item_count]);

  useEffect(() => {
    if (ordersCount > prevOrdersCountRef.current) {
      setAnimateOrders(true);
      const timer = setTimeout(() => setAnimateOrders(false), 350);
      return () => clearTimeout(timer);
    }
    prevOrdersCountRef.current = ordersCount;
  }, [ordersCount]);

  const isMobile = window.innerWidth <= 768;

  const formatAddress = (user) => {
    if (!user) return "N/A";
    const { block, lot, street, phase, community } = user;
    const blockLot = [block && `B${block}`, lot && `L${lot}`].filter(Boolean).join(" - ");
    const rest = [street, phase?.toLowerCase(), community].filter(Boolean).join(", ");
    return [blockLot, rest].filter(Boolean).join(", ");
  };

  const generateGradientFromId = (id) => {
    const hash = Array.from(String(id)).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `linear-gradient(135deg, hsl(${hash % 360}, 70%, 60%), hsl(${(hash * 7) % 360}, 70%, 45%))`;
  };

  useEffect(() => {
    const loadShop = async () => {
      try {
        const res = await axiosClient.get(`/shops/${shopId}`);
        if (!res.data?.shop) {
          setErrorMessage("Shop not found");
          return;
        }
        setShop(res.data.shop);
      } catch {
        setErrorMessage("Shop not found");
      } finally {
        setLoading(false);
      }
    };
    loadShop();
  }, [shopId]);

  const handleAddAndGoCart = async (productId) => {
    if (!user || !token) {
      toast.error("Please log in to add items to tray");
      return;
    }
    try {
      await addToCartApi(productId, 1, token);
      await refreshCart();
      toast.success("Added to tray 🛒");
    } catch {
      toast.error("Failed to add item");
    }
  };

  if (loading) return <p className="loading-text">Loading shop...</p>;
  if (errorMessage || !shop) return <p className="shop-page-friendly-not-found">{errorMessage || "Shop not found"}</p>;

  const availableProducts = shop.products.filter(p => isProductAvailable(p, shop.open));

  const groupedProducts = (() => {
    if (!isMobile) return [];
    const instant = [], preorder = [];
    availableProducts.forEach((p) => (p.preorder_delivery ? preorder.push(p) : instant.push(p)));
    const groupByLabel = (list) => {
      const groups = {};
      list.forEach((p) => {
        const label = getDeliveryLabel(p);
        groups[label] ||= [];
        groups[label].push(p);
      });
      return groups;
    };
    return [
      ...Object.entries(groupByLabel(instant)),
      ...Object.entries(groupByLabel(preorder)).sort(([ , a], [ , b]) => getDeliveryDateTime(a[0]) - getDeliveryDateTime(b[0])),
    ];
  })();

  const otherCommunity = shop.community === "Sampaguita Homes" ? "Sampaguita West" : "Sampaguita Homes";

  return (
    <div className="shop-page-friendly">
      {/* HEADER */}
      <div className="shop-page-friendly-header">
        <div className="shop-page-friendly-image-container">
          <BackButton
            className="shop-page-friendly-back-btn"
            condition={user?.id === shop.user?.id}
            conditionalTo="/seller/products"
          />

          {shop.image_url ? (
            <img src={shop.image_url} alt={shop.name} className="shop-page-friendly-image" />
          ) : (
            <div className="shop-page-friendly-image-placeholder" style={{ background: generateGradientFromId(shop.id) }}>
              <span className="shop-page-friendly-image-placeholder-text">{shop.name}</span>
            </div>
          )}
        </div>
        <p className={`shop-status-pill ${shop.open ? "open" : "closed"}`}>{shop.open ? "Open" : "Closed"}</p>
      </div>

      {/* PRODUCTS */}
      {availableProducts.length > 0 ? (
        <div className="shop-page-friendly-products">
          <div className="shop-page-friendly-products-header-wrapper">
            <h2 className="shop-page-friendly-products-header">Menu</h2>
            <GlobalCartOrders
              wrapperClass="shop-icons-wrapper"
              buttonClass="shop-page-friendly-cart-btn"
              iconClass="shop-page-friendly-cart-icon"
              badgeClass="shop-cart-count"
              animateCart={animateCart}
              animateOrders={animateOrders}
            />
          </div>

          {isMobile ? (
            <div className="shop-page-friendly-mobile-menu">
              {groupedProducts.map(([label, products]) => (
                <div key={label} className="shop-page-friendly-menu-group">
                  <div className="shop-page-friendly-menu-group-header">{label}</div>
                  {products.map(product => (
                    <div key={product.id} className="shop-page-friendly-menu-item">
                      <div className="shop-page-friendly-menu-item-main">
                        <p className="shop-page-friendly-menu-item-name" onClick={() => navigate(`/product/${product.id}`)}>{product.name}</p>
                        {product.description && <p className="shop-page-friendly-menu-item-desc">{product.description}</p>}
                        <div className="shop-page-friendly-menu-item-meta">
                          <span className="shop-page-friendly-menu-item-price">₱{Number(product.price).toFixed(2)}</span>
                          <span>{product.stock} left</span>
                        </div>
                      </div>
                      <button className="shop-page-friendly-menu-add-btn" onClick={() => handleAddAndGoCart(product.id)}>Add</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="shop-page-friendly-products-grid">
              {availableProducts.map(product => (
                <div key={product.id}>
                  <ProductCard product={product} clickable={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="shop-page-friendly-no-products">No available products at the moment.</p>
      )}

      {/* FOOTER */}
      {shop.user && (
        <footer className="shop-page-friendly-footer">
          <div className="shop-page-friendly-info">
          <h4>Shop Info</h4>
            <p>📍 {formatAddress(shop.user)}</p>
            <p>📞 {shop.user.contact_number || "N/A"}</p>
          </div>

          <div className="shop-delivery-info">
            <h4>Delivery</h4>
            <ul className="shop-delivery-info-list">
              {user?.id === shop.user?.id ? (
                <>
                  <li>
                    <span className="delivery-community">{shop.community.includes("Homes") ? "Homes" : "West"}:</span>
                    <span className="delivery-charge free">Free</span>
                  </li>
                  <li>
                    <span className="delivery-community">{otherCommunity.includes("Homes") ? "Homes" : "West"}:</span>
                    <span className={`delivery-charge ${Number(shop.cross_comm_charge) === 0 ? "free" : ""}`}>
                      {Number(shop.cross_comm_charge) === 0 ? "Free" : `₱${shop.cross_comm_charge} charge for orders below ₱${Number(shop.cross_comm_minimum).toFixed(2)}`}
                    </span>
                  </li>
                </>
              ) : (
                <li>
                  <span className={`delivery-charge ${Number(shop.cross_comm_charge) === 0 ? "free" : ""}`}>
                    {user.community === shop.community ? <span className="free">Free</span> : Number(shop.cross_comm_charge) === 0 ? <span className="free">Free</span> : `₱${shop.cross_comm_charge} charge`}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="shop-payment-methods">
            <h4>Payment</h4>
            <ul>
              <li data-provider="COD">COD</li>
              {[...new Set(shop.shop_payment_accounts?.filter(acc => acc.active).map(acc => acc.provider))].map(provider => (
                <li key={provider} data-provider={provider}>{provider}</li>
              ))}
            </ul>
          </div>
        </footer>
      )}

      {/* OWNER ACTIONS */}
      {user?.id === shop.user?.id && (
        <div className="shop-owner-actions">
          <button className="shop-edit-btn" onClick={() => navigate(`/shops/${shop.id}/edit`)}>✏️ Edit Shop</button>
        </div>
      )}
    </div>
  );
}
