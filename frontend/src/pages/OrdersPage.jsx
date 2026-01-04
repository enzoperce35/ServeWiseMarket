import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import BackButton from "../components/common/BackButton";
import "../css/pages/OrdersPage.css"; // Create this CSS file

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await axiosClient.get("/orders");
      const ordersData = Array.isArray(res.data.orders) ? res.data.orders : [res.data.orders];
      setOrders(ordersData);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) return <p className="loading-text">Loading your orders...</p>;
  if (orders.length === 0) return <p className="empty-text">You have no orders yet.</p>;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "preparing":
        return "status-preparing";
      case "confirmed":
        return "status-accepted";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const res = await axiosClient.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: res.data.status } : o
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel order");
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <BackButton className="orders-back-btn" />
      </div>

      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order.id}</span>
              <span className={`order-status ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="order-details">
              <p><strong>Shop:</strong> {order.shop?.name || "Unknown"}</p>
              <p>
                <strong>Total Amount:</strong> ₱{order.total_amount ? Number(order.total_amount).toFixed(2) : "0.00"}
              </p>

              {order.delivery_date && (
                <p>
                  <strong>Delivery:</strong> {order.delivery_date} {order.delivery_time}
                </p>
              )}
              {order.cross_comm_delivery && (
                <p className="cross-comm">Cross-community delivery applied</p>
              )}
            </div>
            <button className="view-order-btn" onClick={() => window.location.href = `/orders/${order.id}`}>
              View Details
            </button>

            {order.status === "pending" && (
              <button
                className="cancel-order-btn"
                onClick={() => cancelOrder(order.id)}
              >
                Cancel Order
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
