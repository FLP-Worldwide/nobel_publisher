"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, IndianRupee, ShoppingBag, CircleCheck, AlertCircle, BookOpen } from "lucide-react";
import { apiJson } from "@/utils/checkout";

const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
const actionText = {
  CHANGES_REQUESTED: ["Your review notes are ready", "Read the notes, make changes and resubmit."],
  PAYMENT_PENDING: ["Your submission needs its review fee", "Complete or verify the one-time ₹199 payment."],
  APPROVED: ["Your book is ready for its next step", "Set a selling price and confirm publication."],
  REJECTED: ["Review the decision on your submission", "Read the review notes before starting a new revision."],
};
export default function AuthorInsights({ books, loading, error: bookError, token, api }) {
  const [sales, setSales] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const load = useCallback(async (signal) => {
    if (!token || !api) { setBusy(false); setError("Sales service is not available."); return; }
    setBusy(true); setError("");
    try { const data = await apiJson(`${api}/author/dashboard`, token, { signal }); if (!signal?.aborted) setSales(data); }
    catch (err) { if (!signal?.aborted) setError(err.message); }
    finally { if (!signal?.aborted) setBusy(false); }
  }, [token, api]);
  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);
  const priority = { CHANGES_REQUESTED: 0, PAYMENT_PENDING: 1, APPROVED: 2, REJECTED: 3 };
  const actions = [...books].filter(book => book.status in actionText).sort((a, b) => priority[a.status] - priority[b.status]);
  const draft = books.find(book => book.status === "DRAFT");
  return <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
    <section className="overflow-hidden rounded-2xl border border-[#e0e5da] bg-white" aria-labelledby="next-actions">
      <div className="flex items-center justify-between border-b border-[#eef0e9] px-6 py-5"><h2 id="next-actions" className="text-base font-semibold text-[#294736]">Your next steps</h2>{!loading && !bookError && <span className="rounded-full bg-[#f6ead8] px-2.5 py-1 text-[10px] font-bold text-[#946329]">{actions.length} need attention</span>}</div>
      {loading ? <p className="p-6 text-sm text-slate-500">Finding your next step…</p> : bookError ? <p className="p-6 text-sm text-slate-500">Next steps will appear when your books are available.</p> : actions.length ? <div className="divide-y divide-[#eef0e9]">{actions.slice(0, 3).map(book => <Link key={book.id} href={`/write/tool/step2/${book.id}/pricing_info`} className="group flex gap-3 px-6 py-5 hover:bg-[#fafbf7]"><span className="mt-1 text-[#af8552]"><AlertCircle size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#294736]">{book.title}</p><p className="mt-1 text-xs font-medium text-[#8c703c]">{actionText[book.status][0]}</p><p className="mt-1.5 text-xs leading-5 text-[#7b8375]">{book.reviews?.[0]?.reviewerNotes || actionText[book.status][1]}</p></div><ArrowRight size={16} className="mt-1 shrink-0 text-[#83937b] group-hover:translate-x-1" /></Link>)}{actions.length > 3 && <a href="#your-books-heading" className="block px-6 py-4 text-xs font-bold text-[#466d4c]">See all {actions.length} books needing attention →</a>}</div> : <div className="p-6"><CircleCheck size={24} className="text-[#6a8a62]" /><h3 className="mt-3 text-sm font-semibold text-[#294736]">{draft ? "A good day to keep writing" : books.length ? "You're all caught up" : "Start your self-publishing journey"}</h3><p className="mt-2 text-xs leading-6 text-[#7b8375]">{draft ? `Pick up where you left off in “${draft.title}”.` : books.length ? "No publishing actions are waiting for you. Check your bookshelf for review updates." : "Use the writing, cover and preview tools for free. Pay the one-time ₹199 review fee when your complete book is ready to submit."}</p><Link href={draft ? `/write/tool/${draft.id}` : books.length ? "#your-books-heading" : "/write/tool"} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#466d4c]">{draft ? "Continue writing" : books.length ? "View your books" : "Start your first book"}<ArrowRight size={14} /></Link></div>}
    </section>
    <section className="rounded-2xl border border-[#e0e5da] bg-white p-6" aria-labelledby="sales-heading">
      <div className="flex items-center justify-between gap-3"><h2 id="sales-heading" className="text-base font-semibold text-[#294736]">Retail sales & author earnings</h2><span className="text-[10px] font-semibold uppercase tracking-wider text-[#8d9786]">All time</span></div>
      {error ? <div role="alert" className="mt-5 text-sm text-red-800"><p>{error}</p><button className="mt-3 underline" onClick={() => load()}>Retry sales summary</button></div> : <>
        <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6">{[[ShoppingBag, "Retail copies sold", sales?.retailCopiesSold], [IndianRupee, "Accrued author earnings", sales ? money(sales.accruedEarnings) : null]].map(([Icon, label, value]) => <div key={label}><dt className="flex items-center gap-1.5 text-xs text-[#7b8375]"><Icon size={14} />{label}</dt><dd className="mt-2 text-2xl font-semibold tabular-nums text-[#284f3e]">{busy ? "—" : value}</dd></div>)}</dl>
        {!busy && sales && <><p className="mt-5 rounded-lg bg-[#f4f6f0] px-3 py-2.5 text-[11px] leading-5 text-[#73806b]">Verified paid retail orders, including archived titles. Author copies, cancelled orders and refunded payments are excluded. Earnings are accrued, not a withdrawable balance.</p>{sales.missingEarningsSnapshots > 0 && <p role="status" className="mt-3 text-xs text-amber-800">Some legacy sales have no earnings snapshot. Earnings shown are incomplete; contact the publishing team.</p>}
          {sales.books.length > 0 ? <div className="mt-5 space-y-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8d9786]"><BarChart3 size={13} />Top titles by copies sold</p>{sales.books.slice(0, 3).map(book => <div key={book.bookId}><div className="mb-2 flex justify-between gap-4 text-xs"><span className="truncate font-medium text-[#455c40]">{book.title}</span><span className="shrink-0 tabular-nums text-[#7b8375]">{book.copies} {book.copies === 1 ? "copy" : "copies"}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#edf0e7]"><div className="h-full rounded-full bg-[#8aa17b]" style={{ width: `${Math.max(2, book.copies / sales.books[0].copies * 100)}%` }} /></div></div>)}</div> : <div className="mt-5 flex items-start gap-2 text-xs leading-6 text-[#7b8375]"><BookOpen size={18} className="mt-1 shrink-0" /><p>Your first verified retail sale will appear here. Publish your book and share its bookstore page with readers.</p></div>}
          <p className="mt-5 text-[10px] text-[#929b8b]">Updated {new Date(sales.generatedAt).toLocaleString("en-IN")}</p></>}
      </>}
    </section>
  </div>;
}
