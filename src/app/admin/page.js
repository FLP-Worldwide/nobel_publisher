"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Clock3, RefreshCw } from "lucide-react";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function formatDate(value) {
  if (!value) return "Recently submitted";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ReviewQueuePage() {
  const { data: session, status } = useSession();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    const token = session?.user?.accessToken;
    if (!token || !API) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/reviews`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Could not load the review queue.");
      setBooks(Array.isArray(data) ? data : data.reviews || []);
    } catch (err) {
      setError(err.message || "Could not load the review queue.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.accessToken]);

  useEffect(() => {
    if (status === "authenticated") loadQueue();
  }, [status, loadQueue]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Editorial queue</p>
          <h1 className="text-3xl font-bold tracking-tight">Books awaiting review</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Open a submission to read the complete manuscript, check its publishing details, and leave one clear decision.
          </p>
        </div>
        <button
          type="button"
          onClick={loadQueue}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading review queue">
          {[0, 1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-slate-200" />)}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-400" />
          <h2 className="text-lg font-bold">The review queue is clear</h2>
          <p className="mt-1 text-sm text-slate-500">New author submissions will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {books.map((review) => {
            const book = review.book || {};
            return (
            <article key={review.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">In review</span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" /> {formatDate(review.submittedAt || book.updatedAt)}
                </span>
              </div>
              <h2 className="text-xl font-bold leading-tight">{book.title || "Untitled book"}</h2>
              <p className="mt-1 text-sm text-slate-600">by {book.authorName || book.user?.name || "Unknown author"}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs text-slate-500">Language</dt>
                  <dd className="mt-1 font-semibold">{book.language || "—"}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs text-slate-500">Submitted version</dt>
                  <dd className="mt-1 font-semibold">Revision {review.revision?.version || "—"}</dd>
                </div>
              </dl>
              <Link
                href={`/admin/books/${review.id}`}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-900"
              >
                Review complete book
              </Link>
            </article>
          )})}
        </div>
      )}
    </main>
  );
}
