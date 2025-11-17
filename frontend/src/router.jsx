// src/router.jsx
import { createBrowserRouter } from "react-router-dom";

// Pages
import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";

// Components
import Navbar from "./components/Navbar";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <ProductsPage />
      </>
    ),
  },
  {
    path: "/login",
    element: (
      <>
        <Navbar />
        <LoginPage />
      </>
    ),
  },
  {
    path: "/signup",
    element: (
      <>
        <Navbar />
        <SignupPage />
      </>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
