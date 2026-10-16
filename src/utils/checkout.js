// Keep the same key through reloads and failed responses. Each account and
// immutable checkout payload has its own reservation.
export function checkoutKey(userId, kind, payload) {
  const slot = `nobel-checkout:${userId}:${kind}`;
  const signature = JSON.stringify(payload);
  let saved;
  try { saved = JSON.parse(localStorage.getItem(slot) || "null"); } catch { /* recover old storage */ }
  if (saved?.signature === signature && saved.key) return saved.key;
  const key = crypto.randomUUID();
  localStorage.setItem(slot, JSON.stringify({ key, signature }));
  return key;
}
export function clearCheckoutKey(userId, kind) {
  localStorage.removeItem(`nobel-checkout:${userId}:${kind}`);
}
export async function apiJson(url, token, options = {}) {
  const response = await fetch(url, { ...options, cache: "no-store", headers: {
    "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers,
  } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Request failed. Please try again.");
  return result;
}
