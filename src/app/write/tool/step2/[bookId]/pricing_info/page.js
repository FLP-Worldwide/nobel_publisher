"use client";

import AuthorSidebar from "@/app/components/dashbaord/AuthorSidebar";
import AuthorTopbar from "@/app/components/dashbaord/Topbar";
import AuthorCopyOrder from "@/app/components/dashbaord/AuthorCopyOrder";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Check,
  Circle,
  Clock3,
  Eye,
  IndianRupee,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const STATUS_CONTENT = {
  DRAFT: {
    label: "Draft",
    title: "Your book is not submitted yet",
    description: "Complete the book details, preview every page, and submit the saved version for review.",
    tone: "slate",
  },
  IN_REVIEW: {
    label: "Review in progress",
    title: "Your book is with our review team",
    description: "The submitted version is locked while the team checks its content and publishing details.",
    tone: "amber",
  },
  CHANGES_REQUESTED: {
    label: "Action needed",
    title: "Please update your book",
    description: "Review the note below, make the requested updates, preview the complete book, and submit it again.",
    tone: "orange",
  },
  APPROVED: {
    label: "Approved",
    title: "Your book is approved for publishing",
    description: "Complete the one-time ₹199 publishing payment to make this approved version ready to publish.",
    tone: "emerald",
  },
  PAYMENT_PENDING: {
    label: "Payment pending",
    title: "We are waiting for payment confirmation",
    description: "Your book will publish only after the payment provider confirms the ₹199 fee to our server.",
    tone: "blue",
  },
  PUBLISHED: {
    label: "Published",
    title: "Your book is published",
    description: "The approved and paid version is now live. You can view the listing from your dashboard.",
    tone: "emerald",
  },
  REJECTED: {
    label: "Review closed",
    title: "This version was not approved",
    description: "Read the reviewer note below. Contact the publishing team if you need help with the next step.",
    tone: "red",
  },
  INACTIVE: {
    label: "Inactive",
    title: "This book is currently inactive",
    description: "The book cannot move forward while it is inactive. Contact the publishing team for help.",
    tone: "slate",
  },
};

const TONE_CLASSES = {
  slate: "border-slate-200 bg-slate-50 text-slate-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  orange: "border-orange-200 bg-orange-50 text-orange-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  red: "border-red-200 bg-red-50 text-red-800",
};

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || `Request failed (${response.status})`);
  return body;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function TimelineStep({ label, description, state, last }) {
  const complete = state === "complete";
  const active = state === "active";

  return (
    <li className="relative flex gap-4 pb-7 last:pb-0">
      {!last && (
        <span
          className={`absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 ${complete ? "bg-emerald-300" : "bg-slate-200"}`}
          aria-hidden="true"
        />
      )}
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
          complete
            ? "border-emerald-600 bg-emerald-600 text-white"
            : active
              ? "border-blue-700 bg-blue-50 text-blue-700"
              : "border-slate-300 bg-white text-slate-400"
        }`}
      >
        {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-3 w-3 fill-current" aria-hidden="true" />}
      </span>
      <div className="pt-0.5">
        <p className={`font-bold ${complete || active ? "text-slate-900" : "text-slate-500"}`}>{label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </li>
  );
}

export default function PricingInfo() {
  const params = useParams();
  const bookId = Array.isArray(params?.bookId) ? params.bookId[0] : params?.bookId;
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user?.accessToken;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingPayment, setStartingPayment] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [notice, setNotice] = useState(null);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }),
    [accessToken]
  );

  const loadStatus = useCallback(async () => {
    if (sessionStatus === "loading") return;
    if (!API_BASE) {
      setNotice({ type: "error", text: "The publishing service is not configured." });
      setLoading(false);
      return;
    }
    if (!accessToken) {
      setNotice({ type: "error", text: "Please sign in to view this book's publishing status." });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/books/${bookId}/review-status`, {
        headers: authHeaders,
        cache: "no-store",
      });
      setData(await readJson(response));
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Could not load the review status." });
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeaders, bookId, sessionStatus]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const status = String(data?.status || "DRAFT").toUpperCase();
  const content = STATUS_CONTENT[status] || STATUS_CONTENT.DRAFT;
  const review = data?.review || null;
  const payment = data?.publishingPayment || null;
  const feeAmount = Number(data?.publishingFee?.amount ?? 199);
  const feeCurrency = data?.publishingFee?.currency || "INR";

  const submitted = status !== "DRAFT";
  const reviewComplete = ["APPROVED", "PAYMENT_PENDING", "PUBLISHED"].includes(status);
  const paymentComplete = status === "PUBLISHED" || payment?.status === "PAID";

  async function initiatePayment() {
    setStartingPayment(true);
    setNotice(null);
    try {
      const response = await fetch(`${API_BASE}/books/${bookId}/publishing-payment/initiate`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({}),
      });
      const result = await readJson(response);
      const redirectUrl = result?.gateway?.redirectUrl;

      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      setData((current) => ({
        ...(current || {}),
        status: result?.payment ? "PAYMENT_PENDING" : current?.status,
        publishingPayment: result?.payment || current?.publishingPayment,
        publishingFee: result?.publishingFee || current?.publishingFee,
      }));
      setNotice({
        type: "info",
        text:
          result?.gateway?.available === false
            ? "Online payment is unavailable in this environment. No charge was made. Please try again when the payment service is enabled."
            : "The payment request was created. Refresh the status after completing payment.",
      });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Could not start the payment." });
    } finally {
      setStartingPayment(false);
    }
  }

  async function checkPaymentStatus() {
    setCheckingPayment(true);
    setNotice(null);
    try {
      const response = await fetch(`${API_BASE}/books/${bookId}/publishing-payment/status`, {
        headers: authHeaders,
        cache: "no-store",
      });
      const result = await readJson(response);
      setNotice({
        type: result?.payment?.status === "PAID" ? "success" : "info",
        text:
          result?.payment?.status === "PAID"
            ? "Payment is verified. Your publishing status is being refreshed."
            : "Payment has not been verified yet. If you just paid, wait a moment and check again.",
      });
      await loadStatus();
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Could not check the payment status." });
    } finally {
      setCheckingPayment(false);
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 lg:ml-64">
      <AuthorTopbar />
      <AuthorSidebar currentStep="pricing" />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Review &amp; publish</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Your publishing journey</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              There are no publishing plans to choose from. Review comes first; the one-time ₹199 fee is due only after approval.
            </p>
          </div>
          <Link
            href={`/write/tool/step2/${bookId}/canva/preview`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-300 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Preview submitted book
          </Link>
        </div>

        {notice && (
          <div
            role={notice.type === "error" ? "alert" : "status"}
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : notice.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {notice.text}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-blue-700" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-600">Loading publishing status…</span>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6 sm:p-8">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${TONE_CLASSES[content.tone]}`}>
                    {content.label}
                  </span>
                  <h2 className="mt-5 text-2xl font-bold text-slate-950 sm:text-3xl">{content.title}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{content.description}</p>

                  {status === "DRAFT" && (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={`/write/tool/step2/${bookId}/metadata`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200"
                      >
                        Complete and submit
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/write/tool/step2/${bookId}/canva/preview`}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                      >
                        Preview first
                      </Link>
                    </div>
                  )}

                  {status === "CHANGES_REQUESTED" && (
                    <Link
                      href={`/write/tool/step2/${bookId}/metadata`}
                      className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-200"
                    >
                      Make requested changes
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}

                  {status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={initiatePayment}
                      disabled={startingPayment}
                      className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3 text-base font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {startingPayment ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <IndianRupee className="h-5 w-5" aria-hidden="true" />}
                      {startingPayment ? "Starting secure payment…" : `Pay ₹${feeAmount.toLocaleString("en-IN")} and publish`}
                    </button>
                  )}

                  {status === "PAYMENT_PENDING" && (
                    <button
                      type="button"
                      onClick={checkPaymentStatus}
                      disabled={checkingPayment}
                      className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkingPayment ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
                      {checkingPayment ? "Checking…" : "Check payment status"}
                    </button>
                  )}

                  {status === "PUBLISHED" && (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={`/book/${bookId}`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                      >
                        View book listing
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link
                        href="/author-dashboard"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                      >
                        Return to dashboard
                      </Link>
                    </div>
                  )}
                </div>

                {status === "APPROVED" && (
                  <div className="grid border-t border-slate-200 bg-slate-50 sm:grid-cols-3">
                    <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Publishing fee</p>
                      <p className="mt-2 text-2xl font-bold text-slate-950">₹{feeAmount.toLocaleString("en-IN")}</p>
                      <p className="mt-1 text-xs text-slate-500">One time · {feeCurrency}</p>
                    </div>
                    <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
                      <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                      <p className="mt-2 text-sm font-bold text-slate-900">Server-verified payment</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">The browser cannot mark a book as paid.</p>
                    </div>
                    <div className="p-5">
                      <BadgeCheck className="h-5 w-5 text-blue-700" aria-hidden="true" />
                      <p className="mt-2 text-sm font-bold text-slate-900">Approved version</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Payment applies to this reviewed revision.</p>
                    </div>
                  </div>
                )}
              </section>

              {review?.reviewerNotes && (
                <section className={`rounded-2xl border p-5 sm:p-6 ${status === "CHANGES_REQUESTED" ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`mt-0.5 h-5 w-5 shrink-0 ${status === "CHANGES_REQUESTED" ? "text-orange-700" : "text-slate-600"}`} aria-hidden="true" />
                    <div>
                      <h2 className="font-bold text-slate-950">Reviewer note</h2>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.reviewerNotes}</p>
                      {review.reviewedAt && <p className="mt-3 text-xs font-medium text-slate-500">Reviewed {formatDate(review.reviewedAt)}</p>}
                    </div>
                  </div>
                </section>
              )}

              {review?.authorMessage && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <h2 className="font-bold text-slate-950">Your submission note</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.authorMessage}</p>
                </section>
              )}

              {status === "PUBLISHED" && (
                <AuthorCopyOrder
                  bookId={bookId}
                  apiBase={API_BASE}
                  authHeaders={authHeaders}
                  user={session?.user}
                />
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-slate-950">Publishing steps</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Your current position is shown below.</p>
              <ol className="mt-6">
                <TimelineStep
                  label="Submit for review"
                  description={review?.submittedAt ? `Submitted ${formatDate(review.submittedAt)}` : "Save and submit the complete book."}
                  state={submitted ? "complete" : "active"}
                />
                <TimelineStep
                  label="Editorial review"
                  description="The team reviews the exact version you submitted."
                  state={reviewComplete ? "complete" : status === "IN_REVIEW" || status === "CHANGES_REQUESTED" ? "active" : "pending"}
                />
                <TimelineStep
                  label={`Pay ₹${feeAmount.toLocaleString("en-IN")}`}
                  description="The publishing fee is available only after approval."
                  state={paymentComplete ? "complete" : status === "APPROVED" || status === "PAYMENT_PENDING" ? "active" : "pending"}
                />
                <TimelineStep
                  label="Published"
                  description="Your listing goes live after verified payment."
                  state={status === "PUBLISHED" ? "complete" : "pending"}
                  last
                />
              </ol>

              {payment && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Clock3 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    Payment {String(payment.status || "pending").toLowerCase()}
                  </div>
                  {payment.createdAt && <p className="mt-2 text-xs text-slate-500">Created {formatDate(payment.createdAt)}</p>}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </section>
  );
}
