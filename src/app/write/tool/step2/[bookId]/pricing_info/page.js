"use client";

import useCanonicalBookUrl from "@/hooks/useCanonicalBookUrl";
import AuthorSidebar from "@/app/components/dashbaord/AuthorSidebar";
import AuthorCopyOrder from "@/app/components/dashbaord/AuthorCopyOrder";
import { ArrowRight, Check, Eye, Loader2, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
const CONTENT = {
  DRAFT: ["Draft", "Prepare your book for review", "Complete the details and check every page before submitting."],
  PAYMENT_PENDING: ["Review fee due", "Complete your ₹199 review payment", "Your submitted version is saved and locked. The editorial review begins once payment is verified."],
  IN_REVIEW: ["In review", "Your book is with our reviewers", "Your manuscript, cover and details stay locked until a decision is recorded."],
  CHANGES_REQUESTED: ["Changes requested", "A few updates are needed", "Read the reviewer’s notes, update your book and submit again. Your review fee payment or waiver carries forward."],
  APPROVED: ["Approved", "Set your selling price", "Your review is complete. Choose a price, check your earnings and publish your book."],
  PUBLISHED: ["Published", "Your book is available to readers", "We print each copy when an order is placed. You can also order discounted author copies."],
  REJECTED: ["Not approved", "Read your review decision", "Check the reviewer’s notes below. You can prepare a new revision for review without paying the review fee again."],
  INACTIVE: ["Inactive", "This book is inactive", "Contact the publishing team for help."],
};
async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body;
}

export default function PricingInfo() {
  const params = useParams();
  const bookId = Array.isArray(params?.bookId) ? params.bookId[0] : params?.bookId;
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const [data, setData] = useState(null);
  useCanonicalBookUrl(bookId,data?.bookPublicId);
  const [pricingData, setPricingData] = useState(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState(null);
  const headers = useMemo(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }), [token]);
  const loadStatus = useCallback(async () => {
    if (sessionStatus === "loading") return;
    if (!token || !API || !bookId) { setLoading(false); setNotice({ error: true, text: "Sign in to open this book’s review status." }); return; }
    setLoading(true);
    try {
      const result = await readJson(await fetch(`${API}/books/${bookId}/review-status`, { headers, cache: "no-store" }));
      setData(result);
      setPricingData(null);
      if (["APPROVED", "PUBLISHED"].includes(result.status)) {
        const quote = await readJson(await fetch(`${API}/books/${bookId}/pricing`, { headers, cache: "no-store" }));
        setPricingData(quote);
        setPrice(quote.pricing?.retailPrice ? String(quote.pricing.retailPrice) : "");
      }
    } catch (error) { setNotice({ error: true, text: error.message }); }
    finally { setLoading(false); }
  }, [sessionStatus, token, bookId, headers]);
  useEffect(() => { loadStatus(); }, [loadStatus]);

  const status = data?.status || "DRAFT";
  const demo = data?.reviewFee?.mode === "demo";
  const feeWaived = Boolean(data?.reviewFee?.waived);
  const [label, title, description] = status === "PAYMENT_PENDING" && demo
    ? ["Ready for demo review", "Continue without payment", "Your saved version is locked. Submit it to the review team with the fee waived; no payment will be collected."]
    : CONTENT[status] || CONTENT.DRAFT;
  const payment = data?.reviewPayment || data?.publishingPayment;
  const review = data?.review;
  const pricing = pricingData?.pricing;
  const fee = Number(data?.reviewFee?.amount ?? data?.publishingFee?.amount ?? 199);
  const retail = Number(price);
  const printCost = Number(pricing?.printCost || 0);
  const commissionPercent = Number(pricing?.commissionPercent ?? 25);
  const margin = Math.round((retail - printCost) * 100);
  const platformFee = Math.round(margin * commissionPercent / 100) / 100;
  const authorEarnings = margin / 100 - platformFee;
  const authorCopyPrice = Math.round(retail * (100 - Number(pricing?.authorCopyDiscountPercent ?? 30))) / 100;
  const priceValid = Boolean(pricing) && Number.isFinite(retail) && retail > 0 && retail >= Number(pricing.minimumSellingPrice) && /^\d+(\.\d{1,2})?$/.test(price);
  const feePaid = payment?.status === "PAID";

  async function payReviewFee() {
    setBusy("pay"); setNotice(null);
    try {
      const result = await readJson(await fetch(`${API}/books/${bookId}/publishing-payment/initiate`, { method: "POST", headers, body: "{}" }));
      if (result?.reviewFee?.waived) {
        await loadStatus();
        setNotice({ error: false, text: "Your book is in the review queue. The demo review fee was waived; no payment was collected." });
        return;
      }
      const redirect = result?.gateway?.redirectUrl;
      if (redirect) { window.location.assign(redirect); return; }
      setNotice({ error: false, text: result?.gateway?.available === false ? "Payment is temporarily unavailable. No charge was made. Please try again later." : "Payment request created. Check its status after completing payment." });
      await loadStatus();
    } catch (error) { setNotice({ error: true, text: error.message }); }
    finally { setBusy(""); }
  }
  async function checkPayment() {
    setBusy("check"); setNotice(null);
    try {
      const result = await readJson(await fetch(`${API}/books/${bookId}/publishing-payment/status`, { headers, cache: "no-store" }));
      setNotice({ error: false, text: result?.reviewFee?.waived ? "Review fee waived. No payment was collected." : result?.payment?.status === "PAID" ? "Payment verified. Your book is ready for editorial review." : "Payment is not confirmed yet. If you just paid, wait a moment and check again." });
      await loadStatus();
    } catch (error) { setNotice({ error: true, text: error.message }); }
    finally { setBusy(""); }
  }
  async function publish(event) {
    event.preventDefault();
    if (!priceValid) { setNotice({ error: true, text: `Choose a selling price of at least ${money(pricing?.minimumSellingPrice)} with no more than two decimal places.` }); return; }
    setBusy("publish"); setNotice(null);
    try {
      await readJson(await fetch(`${API}/books/${bookId}/publish`, { method: "POST", headers, body: JSON.stringify({ retailPrice: retail }) }));
      setNotice({ error: false, text: "Your book is published and available in the bookstore." });
      await loadStatus();
    } catch (error) { setNotice({ error: true, text: error.message }); }
    finally { setBusy(""); }
  }

  return <section className="ui-workspace">
    <AuthorSidebar currentStep="pricing" />
    <main className="ui-shell">
      <header className="ui-heading"><div><p className="ui-eyebrow">04 / Review & release</p><h1>From your desk to readers</h1><p>{demo || feeWaived ? "Submit → editorial approval → set your price → publish." : "Submit → pay the review fee → approval → set your price → publish."}</p></div><Link href={`/write/tool/step2/${bookId}/canva/preview`} className="ui-button ui-button-secondary"><Eye size={15}/>Preview book</Link></header>
      {notice && <p role={notice.error ? "alert" : "status"} className={`mb-5 rounded-xl border p-4 text-sm ${notice.error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice.text}</p>}
      {loading ? <div className="ui-card flex items-center gap-3"><Loader2 className="animate-spin" size={18}/>Loading book status…</div> : !data ? <button onClick={loadStatus} className="ui-button">Try again</button> : <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <section className="ui-card"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#19334c]">{label}</span><h2 className="!mt-4 !text-xl">{title}</h2><p className="ui-help mt-2">{description}</p>
            {["DRAFT", "CHANGES_REQUESTED"].includes(status) && <Link className="ui-button mt-5" href={`/write/tool/step2/${bookId}/metadata`}>{status === "DRAFT" ? "Complete and submit" : "Make requested changes"}<ArrowRight size={15}/></Link>}
            {status === "PAYMENT_PENDING" && <div className="mt-5"><p className="mb-4 text-2xl font-semibold text-[#19334c]">{demo ? "No payment required" : money(fee)} <span className="text-xs font-normal text-slate-500">{demo ? "demo review" : "one-time review fee per book"}</span></p><div className="flex flex-wrap gap-3"><button onClick={payReviewFee} disabled={Boolean(busy)} className="ui-button">{busy === "pay" ? (demo ? "Submitting to review…" : "Opening secure payment…") : demo ? "Continue without payment" : `Pay ${money(fee)} review fee`}</button><button onClick={checkPayment} disabled={Boolean(busy)} className="ui-button ui-button-secondary"><RefreshCw size={14} className={busy === "check" ? "animate-spin" : ""}/>Check payment</button></div><p className="mt-3 text-xs text-slate-500">{demo ? "If you previously started a payment, check its status first. Editorial approval is still required." : "Already paid? Check payment before starting again. Payment does not guarantee approval."}</p></div>}
            {status === "PUBLISHED" && <div className="mt-5 flex flex-wrap gap-3"><Link href={`/book/${bookId}`} className="ui-button">View book listing<ArrowRight size={15}/></Link><Link href="/author-dashboard" className="ui-button ui-button-secondary">Writing desk</Link></div>}
          </section>
          {review?.reviewerNotes && <section className="ui-card"><h2>Notes from your reviewer</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{review.reviewerNotes}</p></section>}
          {status === "APPROVED" && pricing && <form onSubmit={publish} className="ui-card space-y-5">
            <div><h2>Your price. Clear earnings.</h2><p className="ui-help">Printing and cover: {money(printCost)} per copy · {pricing.pageCount} approved pages. We deduct printing first, then {commissionPercent}% of the remaining amount as the platform fee.</p></div>
            <div><label htmlFor="selling-price" className="ui-label">Selling price (₹)</label><input id="selling-price" type="number" inputMode="decimal" min={pricing.minimumSellingPrice} step="0.01" required value={price} onChange={event => setPrice(event.target.value)} className="ui-field max-w-xs" aria-describedby="selling-price-help"/><p id="selling-price-help" className="ui-help">Minimum {money(pricing.minimumSellingPrice)} so discounted author copies cover the printing cost.</p></div>
            <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 px-4 text-sm"><div className="flex justify-between py-3"><dt>Reader pays per copy</dt><dd>{priceValid ? money(retail) : "—"}</dd></div><div className="flex justify-between py-3"><dt>Printing, including cover</dt><dd>− {money(printCost)}</dd></div><div className="flex justify-between py-3"><dt>Platform fee · {commissionPercent}% after printing</dt><dd>{priceValid ? `− ${money(platformFee)}` : "—"}</dd></div><div className="flex justify-between py-3 font-semibold text-emerald-800"><dt>Your earnings per retail copy</dt><dd>{priceValid ? money(authorEarnings) : "—"}</dd></div></dl>
            <p className="rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-600">Author copies cost {priceValid ? money(authorCopyPrice) : "30% less than your selling price"} each, minimum {pricing.authorCopyMinQty || 5} copies. Author-copy orders do not earn royalties or count towards sales badges. Delivery is shown separately at checkout.</p>
            <button type="submit" disabled={Boolean(busy) || !priceValid || !pricingData.canPublish} className="ui-button">{busy === "publish" ? "Publishing…" : "Confirm price and publish"}<ArrowRight size={15}/></button>
          </form>}
          {status === "APPROVED" && !pricing && <div className="ui-card"><p className="text-sm">Pricing could not be loaded. Reload before publishing.</p><button onClick={loadStatus} className="ui-button mt-3">Reload pricing</button></div>}
          {status === "PUBLISHED" && pricing && <section className="ui-card"><h2>Published price</h2><dl className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-500">Selling price</dt><dd className="mt-1 font-semibold">{money(pricing.retailPrice)}</dd></div><div><dt className="text-slate-500">Your earnings per retail copy</dt><dd className="mt-1 font-semibold text-emerald-800">{money(pricing.authorEarnings)}</dd></div></dl></section>}
          {status === "PUBLISHED" && <AuthorCopyOrder bookId={bookId} apiBase={API} authHeaders={headers} user={session?.user}/>}
          {["APPROVED", "PUBLISHED", "REJECTED"].includes(status) && <section className="ui-card"><h2>Need to update your book?</h2><p className="ui-help">A new revision requires another review. Your review fee clearance carries forward. Starting a revision pauses the public listing until it is approved and published again.</p><Link href={`/write/tool/${bookId}`} className="mt-3 inline-flex text-sm font-semibold text-[#244d43] underline">Start a revision</Link></section>}
        </div>
        <aside className="ui-card lg:sticky lg:top-6"><h2>Publishing progress</h2><ol className="mt-5 space-y-5">{[
          ["Submit your complete book", status !== "DRAFT"],
          [feeWaived ? "Review fee waived · no payment collected" : demo ? "Demo review · no payment required" : `Pay ${money(fee)} for review`, feePaid || feeWaived],
          ["Editorial approval", ["APPROVED", "PUBLISHED"].includes(status)],
          ["Set selling price and publish", status === "PUBLISHED"],
        ].map(([text, done], index) => <li key={text} className="flex items-center gap-3 text-xs"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{done ? <Check size={14}/> : index + 1}</span>{text}</li>)}</ol><p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">{demo || feeWaived ? "Demo mode applies to the review fee only. Printed copies and delivery still require payment." : "One review fee per book. Printing is charged per order. No inventory is printed in advance."}</p>{payment && <p className="mt-3 text-xs text-slate-600">Review payment: {String(payment.status).replaceAll("_", " ").toLowerCase()}</p>}</aside>
      </div>}
    </main>
  </section>;
}
