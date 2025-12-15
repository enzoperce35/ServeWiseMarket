export async function checkout(token) {
  const res = await fetch("/api/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Checkout failed");
  }

  return data.orders;
}
