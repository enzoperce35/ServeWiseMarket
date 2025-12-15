import { useLocation, Navigate } from "react-router-dom";

export default function OrderSuccess() {
  const { state } = useLocation();

  if (!state?.orders) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h2>Order Successful 🎉</h2>

      {state.orders.map(order => (
        <div key={order.id}>
          <h4>{order.shop.name}</h4>
          <p>Total: ₱{order.total_amount}</p>
        </div>
      ))}
    </div>
  );
}
