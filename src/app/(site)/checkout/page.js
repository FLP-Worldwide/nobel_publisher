"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiJson, checkoutKey } from "@/utils/checkout";
const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value || 0));
export default function Checkout() {
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);
  const [shippingMethod, setShipping] = useState("STANDARD");
  const [delivery, setDelivery] = useState({ name: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India" });
  useEffect(() => {
    if (!token) return;
    apiJson(`${API}/cart`, token).then(setCart).catch(err => setError(err.message));
    setDelivery(d => ({ ...d, name: d.name || session.user.name || "", email: d.email || session.user.email || "" }));
  }, [token, session?.user?.name, session?.user?.email]);
  const items = cart?.items || [];
  const subtotal = items.reduce((n, item) => n + Number(item.book?.retailPrice ?? item.price) * item.qty, 0);
  const shipping = shippingMethod === "EXPRESS" ? 149 : 79;
  async function reserve(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { delivery, shippingMethod, paymentMethod: "UPI" };
      const key = checkoutKey(session.user.id, "RETAIL", { ...payload, items: items.map(i => ({ id: i.id, qty: i.qty, updatedAt: i.updatedAt })) });
      const result = await apiJson(`${API}/checkout`, token, { method: "POST", body: JSON.stringify({ ...payload, checkoutKey: key }) });
      setOrder(result.order);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function pay() {
    setBusy(true); setError("");
    try {
      const result = await apiJson(`${API}/orders/${order.id}/payment/initiate`, token, { method: "POST", body: "{}" });
      if (result.gateway?.redirectUrl) window.location.assign(result.gateway.redirectUrl);
      else window.location.assign(`/payment/callback?flow=order&orderId=${order.id}`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  if (status === "loading") return <main className="ui-shell">Loading checkout…</main>;
  if (!token) return <main className="ui-shell"><h1>Sign in to checkout</h1><Link className="ui-button mt-5" href="/buyer/login?callbackUrl=/checkout">Sign in</Link></main>;
  return <main className="ui-shell max-w-5xl"><header className="ui-heading"><div><p className="ui-eyebrow">Nobel Books / Checkout</p><h1>Books, delivered to your door</h1><p>Each order is printed after payment is verified.</p></div></header>
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {order ? <section className="ui-card space-y-4"><h2>Confirm order #{order.id}</h2>{order.items.map(item => <p key={item.id}>{item.title || `Book ${item.bookId}`} × {item.qty} <span className="float-right">{money(item.lineTotal)}</span></p>)}<p>Delivery <span className="float-right">{money(order.shippingCharge)}</span></p><p className="border-t pt-4 font-semibold">Total <span className="float-right">{money(order.totalPrice)}</span></p><p className="ui-help">Deliver to {order.customerName}, {order.addressLine1}, {order.city} {order.postalCode}.</p><button disabled={busy || order.status !== "PENDING"} onClick={pay} className="ui-button">{busy ? "Opening payment…" : `Pay ${money(order.totalPrice)} securely`}</button><Link className="ml-4 text-sm underline" href={`/payment/callback?flow=order&orderId=${order.id}`}>Check payment status</Link></section> : !cart ? <p>Loading your basket…</p> : !items.length ? <p>Your basket is empty. <Link href="/bookstore" className="underline">Browse books</Link></p> : <form onSubmit={reserve} className="grid gap-6 md:grid-cols-[1fr_300px]"><section className="ui-card"><h2>Delivery details</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{[
      ["name", "Full name", "name"], ["email", "Email", "email"], ["phone", "Phone", "tel"], ["postalCode", "PIN code", "postal-code"], ["addressLine1", "Address", "address-line1"], ["addressLine2", "Apartment / landmark (optional)", "address-line2"], ["city", "City", "address-level2"], ["state", "State", "address-level1"],
    ].map(([key, label, autoComplete]) => <label key={key} className="text-sm">{label}<input required={key !== "addressLine2"} type={key === "email" ? "email" : "text"} autoComplete={autoComplete} pattern={key === "postalCode" ? "[0-9]{6}" : undefined} value={delivery[key]} onChange={e => setDelivery(d => ({ ...d, [key]: e.target.value }))} className="ui-field mt-2"/></label>)}</div><p className="ui-help mt-4">Delivery within India.</p><label className="mt-5 block text-sm">Delivery speed<select value={shippingMethod} onChange={e => setShipping(e.target.value)} className="ui-field mt-2"><option value="STANDARD">Standard · ₹79</option><option value="EXPRESS">Express · ₹149</option></select></label></section><aside className="ui-card h-fit space-y-4"><h2>Your basket</h2>{items.map(item => <p key={item.id} className="text-sm">{item.book?.title || `Book ${item.bookId}`} × {item.qty}</p>)}<p>Books <span className="float-right">{money(subtotal)}</span></p><p>Delivery <span className="float-right">{money(shipping)}</span></p><p className="border-t pt-4 font-semibold">Estimated total <span className="float-right">{money(subtotal + shipping)}</span></p><p className="ui-help">Review the confirmed price before payment. Pay using the methods available in PhonePe.</p><button disabled={busy} className="ui-button w-full">{busy ? "Preparing order…" : "Review order"}</button></aside></form>}
  </main>;
}
