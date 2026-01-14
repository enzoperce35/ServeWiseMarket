// components/Navbar.jsx
import { useAuthContext } from "../../context/AuthProvider";
import SellerNavbar from "./SellerNavbar";
import BuyerNavbar from "./BuyerNavbar";

export default function Navbar() {
  const { user, loading } = useAuthContext();

  if (loading) return null;

  if (user?.role === "seller") return <SellerNavbar />;

  return <BuyerNavbar />;
}
