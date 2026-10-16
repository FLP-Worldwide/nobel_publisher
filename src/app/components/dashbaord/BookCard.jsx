"use client";

/* eslint-disable @next/next/no-img-element */
import CoverArtwork from "@/app/components/cover/CoverArtwork";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  Circle,
  Clock3,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    detail: "Continue preparing your book",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
  },
  IN_REVIEW: {
    label: "Under review",
    detail: "Your submitted version is locked",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
  },
  CHANGES_REQUESTED: {
    label: "Changes requested",
    detail: "Read the review note and resubmit",
    badge: "border-orange-200 bg-orange-50 text-orange-800",
  },
  APPROVED: {
    label: "Approved · set your price",
    detail: "Choose a selling price and publish",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  PAYMENT_PENDING: {
    label: "Review fee due",
    detail: "Waiting for verified payment",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
  },
  PUBLISHED: {
    label: "Published",
    detail: "Your book is live",
    badge: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  REJECTED: {
    label: "Not approved",
    detail: "Review closed for this version",
    badge: "border-red-200 bg-red-50 text-red-800",
  },
  INACTIVE: {
    label: "Inactive",
    detail: "Contact the publishing team",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

function hasTextContent(chapter) {
  return String(chapter?.content || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;
}

function ProgressItem({ label, state }) {
  const complete = state === "complete";
  const active = state === "active";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          complete
            ? "border-emerald-600 bg-emerald-600 text-white"
            : active
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-300 bg-white text-slate-400"
        }`}
      >
        {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Circle className="h-2.5 w-2.5 fill-current" aria-hidden="true" />}
      </span>
      <span className={`truncate text-xs font-semibold ${complete || active ? "text-slate-800" : "text-slate-500"}`}>{label}</span>
    </div>
  );
}

export default function BookCard({ book, onDelete, API_BASE, accessToken }) {
  const bookId = book?.id ?? book?._id;
  const rawStatus = String(book?.status || "DRAFT").toUpperCase();
  const status = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.DRAFT;
  const [signedCoverUrl, setSignedCoverUrl] = useState("");
  const [coverFailed, setCoverFailed] = useState(false);

  const coverSrc = useMemo(
    () => book?.thumbnail || book?.frontCoverUrl || signedCoverUrl || "",
    [book?.frontCoverUrl, book?.thumbnail, signedCoverUrl]
  );

  useEffect(() => {
    let cancelled = false;

    async function resolveCover() {
      if (book?.thumbnail || book?.frontCoverUrl || !book?.frontCoverKey || !API_BASE || !accessToken) return;
      try {
        const response = await fetch(
          `${API_BASE}/s3/sign-get-url?key=${encodeURIComponent(book.frontCoverKey)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const result = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && result?.url) setSignedCoverUrl(result.url);
      } catch {
        // The accessible cover placeholder remains visible when signing fails.
      }
    }

    resolveCover();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, accessToken, book?.frontCoverKey, book?.frontCoverUrl, book?.thumbnail]);

  useEffect(() => {
    setCoverFailed(false);
  }, [coverSrc]);

  const submitted = rawStatus !== "DRAFT";
  const bookInfoDone = submitted || Boolean(book?.title && book?.authorName && book?.language && book?.genre);
  const contentDone =
    submitted ||
    (Boolean(book?.design) &&
      Boolean(book?.coverDesign?.front || book?.frontCoverKey || book?.frontCoverUrl) &&
      Boolean(book?.coverDesign?.back || book?.backCoverKey || book?.backCoverUrl) &&
      Array.isArray(book?.chapters) &&
      book.chapters.some(hasTextContent));
  const metadataDone =
    submitted ||
    Boolean(
      book?.description &&
        book?.authorBiography &&
        Array.isArray(book?.categories) &&
        book.categories.length &&
        Array.isArray(book?.keywords) &&
        book.keywords.length &&
        (book?.termsAccepted || book?.termsAcceptedAt)
    );

  const action = (() => {
    switch (rawStatus) {
      case "IN_REVIEW":
        return { label: "View review status", href: `/write/tool/step2/${bookId}/pricing_info` };
      case "CHANGES_REQUESTED":
        return { label: "Review requested changes", href: `/write/tool/step2/${bookId}/pricing_info` };
      case "APPROVED":
        return { label: "Set price and publish", href: `/write/tool/step2/${bookId}/pricing_info` };
      case "PAYMENT_PENDING":
        return { label: "Check payment status", href: `/write/tool/step2/${bookId}/pricing_info` };
      case "PUBLISHED":
        return { label: "View book", href: `/book/${bookId}` };
      case "REJECTED":
      case "INACTIVE":
        return { label: "View details", href: `/write/tool/step2/${bookId}/pricing_info` };
      case "DRAFT":
      default:
        return { label: "Continue publishing", href: `/write/tool/${bookId}` };
    }
  })();

  const reviewStepState = rawStatus === "PUBLISHED" ? "complete" : submitted ? "active" : "pending";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
        <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
          <div className="flex aspect-[3/4] h-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-32">
            {book?.coverDesign ? <CoverArtwork design={book.coverDesign} alt={`${book.title} cover`} className="h-full w-full"/> : coverSrc && !coverFailed ? (
              <img
                src={coverSrc}
                alt={book?.title ? `${book.title} cover` : "Book cover"}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <div className="px-2 text-center text-slate-400">
                <BookOpen className="mx-auto h-7 w-7" aria-hidden="true" />
                <span className="mt-2 block text-[10px] font-bold uppercase tracking-wide">No cover</span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 py-1">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <h3 className="line-clamp-2 text-lg font-bold leading-6 text-slate-950 sm:text-xl">
                {book?.title || "Untitled book"}
              </h3>
              {book.salesBadge && <span className="text-xs font-bold text-amber-700">{book.salesBadge}</span>}
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${status.badge}`}>{status.label}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">by {book?.authorName || "Author name not added"}</p>
            <p className="mt-3 text-sm font-semibold text-slate-700">{status.detail}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {book?.status === "PUBLISHED" && <span>{book.retailCopiesSold || 0} retail copies sold</span>}
              {book?.language && <span>{book.language}</span>}
              {book?.genre && <span>{book.genre}</span>}
              {book?.updatedAt && (
                <span>
                  Updated {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(book.updatedAt))}
                </span>
              )}
            </div>

            {rawStatus === "CHANGES_REQUESTED" && book?.reviews?.[0]?.reviewerNotes && (
              <div className="mt-4 flex gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs leading-5 text-orange-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="line-clamp-2">{book.reviews[0].reviewerNotes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch sm:justify-center">
          <Link
            href={action.href}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:flex-none"
          >
            {action.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {["DRAFT", "CHANGES_REQUESTED"].includes(rawStatus) && (
            <button
              type="button"
              onClick={() => onDelete?.(bookId)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-300 bg-white p-2.5 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-100"
              title="Move book to trash"
              aria-label={`Move ${book?.title || "book"} to trash`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Publishing progress</p>
          {rawStatus === "IN_REVIEW" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              Review in progress
            </span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProgressItem label="Book information" state={bookInfoDone ? "complete" : "active"} />
          <ProgressItem label="Design & content" state={contentDone ? "complete" : bookInfoDone ? "active" : "pending"} />
          <ProgressItem label="Book details" state={metadataDone ? "complete" : contentDone ? "active" : "pending"} />
          <ProgressItem label="Review & publish" state={reviewStepState} />
        </div>
      </div>
    </article>
  );
}
