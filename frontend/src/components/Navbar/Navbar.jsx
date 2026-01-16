import { useAuthContext } from "../../context/AuthProvider";
import SellerNavbar from "./SellerNavbar";
import PublicNavbar from "./PublicNavbar";

export default function Navbar() {
  const { user, loading } = useAuthContext();

  if (loading) return null;

  // Logged-in users (any role) → SellerNavbar
  if (user) return <SellerNavbar />;

  // Guests → PublicNavbar
  return <PublicNavbar />;
}
