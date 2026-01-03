// src/pages/seller/SellerOrdersPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useAuthContext } from "../../context/AuthProvider";
import axiosClient from "../../api/axiosClient";

export default function SellerOrdersPage() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrderIds, setProcessingOrderIds] = useState([]);
  const intervalRef = useRef(null); // for clearing interval on unmount

  // Fetch orders function
  const fetchOrders = async () => {
    if (!user?.shop?.id) return;
    try {
      const res = await axiosClient.get(`/seller/orders?shop_id=${user.shop.id}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + setup auto-refresh
  useEffect(() => {
    if (!user?.shop?.id) return;

    setLoading(true);
    fetchOrders();

    // Refresh orders every 30 seconds
    intervalRef.current = setInterval(fetchOrders, 30000);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [user?.shop?.id]);

  // Confirm order
  const confirmOrder = async (orderId) => {
    if (processingOrderIds.includes(orderId)) return;

    setProcessingOrderIds((prev) => [...prev, orderId]);
    try {
      const res = await axiosClient.patch(`/seller/orders/${orderId}/confirm`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: res.data.status } : o))
      );
      alert("Order confirmed!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to confirm order");
    } finally {
      setProcessingOrderIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  if (!user?.shop?.id) return <p>You don't have a shop yet.</p>;
  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="seller-orders-page">
      <h2>Orders for {user.shop.name}</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>
                Order #{order.id} — Buyer: {order.user?.name || "N/A"}
              </h3>

              <p>Status: {order.status || "N/A"}</p>
              <p>Total: {order.total_amount || 0}</p>
              <p>
                Delivery: {order.delivery_date || "-"} {order.delivery_time || ""}
              </p>

              <div className="products-list">
                <h4>Products:</h4>
                {order.order_items?.length > 0 ? (
                  <ul>
                    {order.order_items.map((item) => (
                      <li key={item.id}>
                        {item.product?.name || "Unknown Product"} × {item.quantity || 0} —{" "}
                        {item.unit_price || 0} each
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No products</p>
                )}
              </div>

              {order.status === "pending" && (
                <button
                  onClick={() => confirmOrder(order.id)}
                  disabled={processingOrderIds.includes(order.id)}
                >
                  {processingOrderIds.includes(order.id) ? "Processing..." : "Confirm Order"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
