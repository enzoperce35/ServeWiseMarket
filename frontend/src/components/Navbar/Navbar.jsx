// components/Navbar.jsx
import { useAuthContext } from "../../context/AuthProvider";
import SellerNavbar from "./SellerNavbar";
import PublicNavbar from "./PublicNavbar";

export default function Navbar() {
  const { user, loading } = useAuthContext();

  if (loading) return null;

  if (user?.role === "seller") return <SellerNavbar />;

  return <PublicNavbar />;
}
