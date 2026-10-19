"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { apiJson } from "@/utils/checkout";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const money = (value, currency = "INR") => new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(Number(value || 0));

export default function PaymentsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [flow, setFlow] = useState("order");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const result = await apiJson(`${API}/admin/payments?flow=${flow}&status=${status}&page=${page}`, token, { signal });
      if (!signal?.aborted) setData(result);
    } catch (err) { if (!signal?.aborted) setError(err.message); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [token, flow, status, page]);
  useEffect(() => {
    const controller = new AbortController(); setData(null); setMessage(""); load(controller.signal);
    return () => controller.abort();
  }, [load]);
  async function verify(id) {
    setBusy(id); setError(""); setMessage("");
    try {
      const result = await apiJson(`${API}/admin/payments/${flow}/${id}/verify`, token, { method: "POST" });
      setMessage(`Payment #${id}: ${result.payment.status.toLowerCase()}.`);
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(null); }
  }
  return <main className="ui-shell">
    <header className="ui-heading"><div><p className="ui-eyebrow">Collections</p><h1>Payments</h1><p>Track order receipts and the one-time ₹199 book review fee.</p></div><button disabled={loading || busy !== null} className="ui-button ui-button-secondary" onClick={() => load()}>Refresh</button></header>
    <p className="mb-6 max-w-3xl text-sm text-slate-600">Customers pay through PhonePe. Check pending attempts against the provider here. Received amounts are payment receipts; bank settlements and author payouts require separate reconciliation.</p>
    <div className="mb-6 flex flex-wrap gap-4">
      <label className="text-sm font-semibold">Payment type<select disabled={busy !== null} className="ui-field mt-1" value={flow} onChange={e => { setFlow(e.target.value); setPage(1); }}><option value="order">Book orders</option><option value="review">Review fees</option></select></label>
      <label className="text-sm font-semibold">Status<select disabled={busy !== null} className="ui-field mt-1" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>{["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"].map(s => <option key={s}>{s}</option>)}</select></label>
    </div>
    {data && <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["PAID", "PENDING", "FAILED", "REFUNDED"].map(s => {
      const groups = data.summary.filter(row => row.status === s);
      return <div className="ui-card" key={s}><p className="text-xs font-semibold text-slate-500">{s === "PAID" ? "Received" : s === "PENDING" ? "Awaiting confirmation" : s === "FAILED" ? "Failed attempts" : "Refunded"}</p>{groups.length ? groups.map(row => <p key={row.currency} className="mt-2 text-lg font-bold">{money(row._sum.amount, row.currency)} <span className="text-xs font-normal">({row._count._all})</span></p>) : <p className="mt-2 text-lg font-bold">₹0.00</p>}</div>;
    })}</div>}
    {data && <p className="mb-4 text-xs text-slate-500">Totals cover all {flow === "review" ? "review-fee" : "order-payment"} attempts across all statuses and pages.</p>}
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
    {message && <p role="status" className="mb-4 text-sm text-blue-800">{message}</p>}
    {loading ? <p>Loading payments…</p> : data && <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><caption className="sr-only">Payment attempts</caption><thead className="bg-slate-100"><tr>{["Payment", "Customer", "Amount", "Status", "Provider reference", "Action"].map(label => <th scope="col" className="px-4 py-3" key={label}>{label}</th>)}</tr></thead><tbody>{data.payments.map(payment => <tr key={payment.id} className="border-t border-slate-200">
        <td className="px-4 py-4"><strong>#{payment.id}</strong><p>{flow === "review" ? payment.book.title : `Order #${payment.orderId} · ${payment.order.kind === "AUTHOR_COPY" ? "Author copies" : "Retail"}`}</p><time className="text-xs text-slate-500">{new Date(payment.createdAt).toLocaleString("en-IN")}</time></td>
        <td className="px-4 py-4">{payment.user.name}<p className="text-xs text-slate-500">{payment.user.email}</p></td><td className="whitespace-nowrap px-4 py-4 font-semibold">{money(payment.amount, payment.currency)}</td><td className="px-4 py-4">{payment.status}</td><td className="max-w-xs break-all px-4 py-4 text-xs">{payment.providerRef || payment.providerOrderId || "Not initiated"}</td><td className="px-4 py-4">{payment.status === "PENDING" && payment.providerOrderId ? <button className="text-blue-800 underline disabled:opacity-50" disabled={busy !== null} onClick={() => verify(payment.id)}>{busy === payment.id ? "Checking…" : "Verify with PhonePe"}</button> : payment.status === "PAID" && flow === "order" ? <Link className="text-blue-800 underline" href="/admin/orders">Open fulfilment</Link> : "—"}</td>
      </tr>)}{!data.payments.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No payment attempts match these filters.</td></tr>}</tbody></table></div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm"><p>{data.total} attempts · Page {page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}</p><div className="flex gap-3"><button className="ui-button ui-button-secondary" disabled={page === 1 || busy !== null} onClick={() => setPage(p => p - 1)}>Previous</button><button className="ui-button ui-button-secondary" disabled={page * data.pageSize >= data.total || busy !== null} onClick={() => setPage(p => p + 1)}>Next</button></div></div>
    </>}
  </main>;
}
