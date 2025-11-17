import React, { useState } from "react";
import "../css/components/Filters.css";


export default function Filters({ products, setFilteredProducts }) {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setFilteredProducts(
      products.filter((p) =>
        p.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={handleSearch}
      />
    </div>
  );
}
