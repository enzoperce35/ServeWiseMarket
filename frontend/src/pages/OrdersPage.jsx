import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthProvider";
import axiosClient from "../api/axiosClient";

export default function OrdersPage() {
  const { token } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await axiosClient.get("/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  if (loading) return <p>Loading orders...</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <div className="orders-page">
      <h2>Your Orders</h2>

      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <h3>{order.shop_name}</h3>
          <p>Status: <strong>{order.status}</strong></p>
          <p>Total: ₱{Number(order.total_amount).toFixed(2)}</p>
          <p>Ordered at: {new Date(order.created_at).toLocaleString()}</p>

          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                <span>{item.product_name}</span>
                <span>Qty: {item.quantity}</span>
                <span>₱{Number(item.unit_price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
