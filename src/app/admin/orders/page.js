"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { apiJson } from "@/utils/checkout";
import { normalizeBook } from "@/utils/bookPreview";
import BookPreview from "@/app/components/editor/BookPreview";
import SignedS3Image from "@/app/components/SignedS3Image";
const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
function OrderCard({ order, token, reload }) {
  const [tracking, setTracking] = useState({ carrier: order.carrier || "", trackingNumber: order.trackingNumber || "", trackingUrl: order.trackingUrl || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [proof, setProof] = useState(null);
  const previewBook = useMemo(() => proof ? normalizeBook({ ...proof.snapshot.book, design: proof.snapshot.design, chapters: proof.snapshot.chapters }) : null, [proof]);
  const next = { PAID: "PRINTING", PRINTING: "SHIPPED", SHIPPED: "DELIVERED" }[order.status];
  async function advance(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { await apiJson(`${API}/orders/${order.id}/fulfilment`, token, { method: "PATCH", body: JSON.stringify({ status: next, ...tracking }) }); await reload(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function openProof(item) {
    setError("");
    try { const data = await apiJson(`${API}/orders/${order.id}/items/${item.id}/proof`, token); setProof(data.revision); }
    catch (err) { setError(err.message); }
  }
  return <article className="ui-card space-y-4"><div className="flex flex-wrap justify-between gap-3"><h2>Order #{order.id} · {order.kind === "AUTHOR_COPY" ? "Author copies" : "Retail"}</h2><strong>{order.status}</strong></div><p className="text-sm">{order.customerName} · {order.customerPhone}<br/>{order.addressLine1}, {order.addressLine2} {order.city}, {order.state} {order.postalCode}<br/>{order.shippingMethod} delivery · ₹{Number(order.totalPrice).toFixed(2)} paid</p>{order.items.map(item => <div key={item.id} className="flex items-center justify-between border-t pt-3"><p>{item.title || `Book ${item.bookId}`} × {item.qty}</p><button className="text-sm underline" onClick={() => openProof(item)}>Open print proof</button></div>)}{proof && <section><button className="mb-4 text-sm underline" onClick={() => setProof(null)}>Close proof</button><p className="mb-4 text-sm">Revision {proof.version} · {proof.contentHash}</p><div className="grid max-w-lg grid-cols-2 gap-4">{["front", "back"].map(side => <SignedS3Image key={side} side={side} coverDesign={proof.snapshot.book.coverDesign} s3Key={proof.snapshot.book[`${side}CoverKey`]} directUrl={proof.snapshot.book[`${side}CoverUrl`]} accessToken={token} alt={`${side} print cover`}/>)}</div><BookPreview book={previewBook}/></section>}{error && <p role="alert" className="text-red-700">{error}</p>}{next && <form onSubmit={advance} className="space-y-3">{next === "SHIPPED" && <div className="grid gap-3 sm:grid-cols-3">{[["carrier", "Carrier"], ["trackingNumber", "Tracking number"], ["trackingUrl", "Tracking link (optional)"]].map(([key, label]) => <label key={key} className="text-sm">{label}<input required={key !== "trackingUrl"} type={key === "trackingUrl" ? "url" : "text"} value={tracking[key]} onChange={e => setTracking(t => ({ ...t, [key]: e.target.value }))} className="ui-field mt-1"/></label>)}</div>}<button disabled={busy} className="ui-button">{busy ? "Saving…" : `Mark ${next.toLowerCase()}`}</button></form>}</article>;
}
export default function FulfilmentPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    if (!token) return;
    try { const data = await apiJson(`${API}/orders/fulfilment`, token); setOrders(data.orders); setError(""); }
    catch (err) { setError(err.message); }
  }, [token]);
  useEffect(() => { reload(); }, [reload]);
  if (status === "unauthenticated") return <main className="ui-shell">Sign in with your admin account.</main>;
  return <main className="ui-shell"><header className="ui-heading"><div><p className="ui-eyebrow">Print on demand</p><h1>Paid orders</h1><p>Print from the purchased revision, then add dispatch tracking.</p></div><button className="ui-button ui-button-secondary" onClick={reload}>Refresh</button></header>{error && <p role="alert" className="mb-4 text-red-700">{error}</p>}<div className="space-y-5">{orders === null ? <p>Loading orders…</p> : !orders.length ? <p>No paid orders to fulfil.</p> : orders.map(order => <OrderCard key={order.id} order={order} token={token} reload={reload}/>)}</div></main>;
}
