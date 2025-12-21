import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchOrdersApi } from "../api/orders";
import { useAuthContext } from "./AuthProvider";

const OrdersContext = createContext();

export const useOrdersContext = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const { token } = useAuthContext();
  const [orders, setOrders] = useState(null);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const response = await fetchOrdersApi(token);
      setOrders(response.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const refreshOrders = () => fetchOrders();

  useEffect(() => {
    fetchOrders();
  }, [token]);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        fetchOrders,
        refreshOrders,
        ordersCount: orders?.length || 0,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};
