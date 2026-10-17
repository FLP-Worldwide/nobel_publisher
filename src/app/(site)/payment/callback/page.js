"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiJson, clearCheckoutKey } from "@/utils/checkout";
const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
function PaymentStatus() {
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const review = params.get("flow") === "publishing";
  const id = params.get(review ? "publishingBookId" : "orderId");
  const valid = /^\d+$/.test(id || "");
  const token = session?.user?.accessToken;
  const returnPath = `/payment/callback?flow=${review ? "publishing" : "order"}&${review ? "publishingBookId" : "orderId"}=${id}`;
  const signInQuery = `?callbackUrl=${encodeURIComponent(returnPath)}`;
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const endpoint = review ? `${API}/books/${id}/publishing-payment` : `${API}/orders/${id}/payment`;
  const check = useCallback(async () => {
    if (!token || !valid) return;
    setBusy(true); setError("");
    try {
      const data = await apiJson(`${endpoint}/status`, token);
      setResult(data);
      if (!review && data.payment?.status === "PAID") clearCheckoutKey(session.user.id, data.order.kind);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }, [token, valid, endpoint, review, session?.user?.id]);
  useEffect(() => { check(); }, [check]);
  useEffect(() => {
    if (!result || result.payment?.status !== "PENDING") return;
    const timer = setTimeout(check, 5000);
    return () => clearTimeout(timer);
  }, [result, check]);
  async function retry() {
    setBusy(true); setError("");
    try {
      const data = await apiJson(`${endpoint}/initiate`, token, { method: "POST", body: "{}" });
      if (data.gateway?.redirectUrl) window.location.assign(data.gateway.redirectUrl);
      else await check();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  const paid = result?.payment?.status === "PAID";
  const refunded = result?.payment?.status === "REFUNDED";
  return <main className="ui-shell max-w-xl"><section className="ui-card space-y-5"><p className="ui-eyebrow">Secure payment status</p><h1 className="text-2xl font-semibold">{refunded ? "Refund recorded" : paid ? "Payment verified" : "Check your payment"}</h1>{!valid ? <p role="alert">The payment reference is missing.</p> : status === "loading" ? <p>Loading…</p> : !token ? <><p>Sign in to verify this payment.</p><div className="flex flex-wrap gap-3">{!review && <Link className="ui-button" href={`/buyer/login${signInQuery}`}>Reader sign in</Link>}<Link className="ui-button ui-button-secondary" href={`/login${signInQuery}`}>Author sign in</Link></div></> : <>
    <p>{refunded ? "A refund has been recorded for this payment. Contact the publishing team for details." : paid ? review ? "Your ₹199 review fee is paid. Your submitted book is now with the editorial team." : "Your order is confirmed. We will print and dispatch your books." : result?.payment?.status === "FAILED" ? "The payment provider confirmed that this attempt failed. You can safely retry payment." : "Payment is not confirmed yet. Check its status before paying again."}</p>
    {result?.order && <p>Order #{result.order.id} · {result.order.status.replaceAll("_", " ")}</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!paid && !refunded && <div className="flex flex-wrap gap-3"><button className="ui-button ui-button-secondary" disabled={busy} onClick={check}>{busy ? "Checking…" : "Check again"}</button>{(result && (!result.payment || result.payment.status === "FAILED" || (result.payment.status === "PENDING" && result.payment.redirectUrl))) && <button className="ui-button" disabled={busy} onClick={retry}>Continue payment</button>}</div>}
    <Link className="inline-block text-sm underline" href={review ? `/write/tool/step2/${id}/pricing_info` : session?.user?.role === "author" ? "/author-dashboard/order" : "/account"}>{review ? "View review progress" : "View your orders"}</Link>
  </>}</section></main>;
}
export default function PaymentCallback() { return <Suspense fallback={<p>Opening payment status…</p>}><PaymentStatus/></Suspense>; }
