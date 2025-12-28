import { isExpired } from "./deliveryDateTime";

export function isProductAvailable(product, shopOpen) {
  if (!product.status || product.stock < 1 || isExpired(product)) return false;
  if (!shopOpen) return product.preorder_delivery === true;
  return true;
}
