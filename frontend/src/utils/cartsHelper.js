/**
 * Merge same products within the same delivery group
 *
 * @param {Array} orders grouped by delivery (what you already have)
 * Example group:
 * [
 *   { productId: 10, name: "Chicken Fillet", qty: 1, price: 145 },
 *   { productId: 10, name: "Chicken Fillet", qty: 2, price: 145 },
 * ]
 */
export function mergeSameProductsInGroup(items) {
  const map = new Map();

  items.forEach(item => {
    const key = `${item.product_id}-${item.variant_id || "no-variant"}`;

    if (!map.has(key)) {
      map.set(key, { ...item });
    } else {
      const existing = map.get(key);

      // merge qty
      existing.quantity += item.quantity;

      // merge line total
      existing.total_price =
        Number(existing.total_price || 0) +
        Number(item.total_price || 0);
    }
  });

  return Array.from(map.values());
}

