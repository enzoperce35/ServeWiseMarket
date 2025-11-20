import React from "react";
import ProductCard from "./ProductCard";

export default function ProductList({ products, onEdit, onDelete }) {
  if (!products.length) return <p>No products found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
