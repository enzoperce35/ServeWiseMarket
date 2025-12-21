///src/components/common/GlobalCartOrders.jsx
import { ShoppingCartIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../context/CartProvider";
import { useOrdersContext } from "../../context/OrdersProvider";

export default function GlobalCartOrders({
    wrapperClass = "",
    buttonClass = "",
    iconClass = "",
    badgeClass = "",
    animateCart = false,
    animateOrders = false,
  }) {
    const navigate = useNavigate();
    const { cart } = useCartContext();
    const { ordersCount } = useOrdersContext();
  
    return (
      <div className={wrapperClass}>
        {/* CART */}
        <button
          className={`${buttonClass} ${animateCart ? "cart-badge-animate" : ""}`}
          onClick={() => navigate("/cart")}
        >
          <ShoppingCartIcon className={iconClass} />
          {(cart?.item_count ?? 0) > 0 && (
            <span className={badgeClass}>{cart.item_count}</span>
          )}
        </button>
  
        {/* ORDERS */}
        <button
          className={`${buttonClass} ${animateOrders ? "cart-badge-animate" : ""}`}
          onClick={() => navigate("/orders")}
        >
          <ClipboardDocumentListIcon className={iconClass} />
          {ordersCount > 0 && (
            <span className={badgeClass}>{ordersCount}</span>
          )}
        </button>
      </div>
    );
  }
