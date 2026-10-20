"use client";

import BookCard from "./BookCard";
import AuthorInsights from "./AuthorInsights";
import UserHeroSection from "./UserHeroSection";
import { BookOpen, Loader2, Plus, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function AuthorDashboard({ apiBase = DEFAULT_API }) {
  const API_BASE = apiBase;
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user?.accessToken;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const visibleBooks = books.filter(book => (filter === "ALL" || book.status === filter) && `${book.title || ""} ${book.titleRoman || ""} ${book.authorName || ""} ${book.authorNameRoman || ""}`.toLowerCase().includes(search.toLowerCase()));

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }),
    [accessToken]
  );

  const fetchBooks = useCallback(async () => {
    if (sessionStatus === "loading") return;
    if (!API_BASE) {
      setError("The publishing service is not configured.");
      setLoading(false);
      return;
    }
    if (!accessToken) {
      setError("Please sign in as an author to view your books.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);
      const response = await fetch(`${API_BASE}/books`, {
        headers: authHeaders,
        cache: "no-store",
      });
      const result = await response.json().catch(() => ([]));
      if (!response.ok) throw new Error(result?.message || `Could not load books (${response.status})`);
      setBooks(Array.isArray(result) ? result : []);
    } catch (fetchError) {
      setError(fetchError?.message || "Could not load your books.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, accessToken, authHeaders, sessionStatus]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  async function handleDelete(id) {
    if (!API_BASE || !id) return;
    const book = books.find((item) => (item.publicId ?? item.id ?? item._id) === id);
    const confirmed = window.confirm(
      `Move “${book?.title || "this book"}” to trash? It will no longer appear on your dashboard.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setNotice("");
      const response = await fetch(`${API_BASE}/books/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || `Could not move book to trash (${response.status})`);
      setBooks((current) => current.filter((item) => (item.publicId ?? item.id ?? item._id) !== id));
      setNotice("Book moved to trash.");
    } catch (deleteError) {
      setError(deleteError?.message || "Could not move the book to trash.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f3] pb-10">
      <UserHeroSection books={books} loading={loading} error={error} onFilter={setFilter} />
      <div className="ui-shell !pb-2 !pt-7"><AuthorInsights books={books} loading={loading} error={error} token={accessToken} api={API_BASE} /></div>

      <section className="ui-shell" aria-labelledby="your-books-heading">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ui-eyebrow">YOUR PUBLISHING JOURNEY</p>
            <h2 id="your-books-heading" className="mt-2 font-serif text-3xl text-[#294736]">
              Your bookshelf
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Open a book to continue working or see exactly where it is in review and publishing.
            </p>
          </div>
          <Link
            href="/write/tool"
            className="ui-button"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Start a new book
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <label className="min-w-48 flex-1 text-xs font-medium text-[#75816c]">Find a book<input type="search" className="ui-field mt-1" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by title or author" /></label>
          <label className="text-xs font-medium text-[#75816c]">Publishing status<select className="ui-field mt-1" value={filter} onChange={event => setFilter(event.target.value)}>{[["ALL", "All books"], ["DRAFT", "In progress"], ["PAYMENT_PENDING", "Review fee due"], ["IN_REVIEW", "Under review"], ["CHANGES_REQUESTED", "Changes requested"], ["APPROVED", "Ready to publish"], ["PUBLISHED", "Published"], ["REJECTED", "Not approved"], ["INACTIVE", "Inactive"]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <button onClick={fetchBooks} disabled={loading} className="ui-button ui-button-secondary self-end"><RefreshCw size={14} />Refresh</button>
        </div>
        {error && (
          <div role="alert" className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchBooks}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 font-bold transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {notice && (
          <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-blue-700" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-600">Loading your books…</span>
          </div>
        ) : books.length === 0 && !error ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center sm:py-20">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <BookOpen className="h-7 w-7" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-slate-950">Start your first book</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Add the title and author details first. You can save your progress and return whenever you are ready.
            </p>
            <Link
              href="/write/tool"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create your first book
            </Link>
          </div>
        ) : (
          <>{visibleBooks.length === 0 && !error && <div className="rounded-2xl border border-[#e0e5da] bg-white p-10 text-center"><p className="text-sm text-slate-600">No books match this search.</p><button onClick={() => { setFilter("ALL"); setSearch(""); }} className="mt-4 text-sm font-semibold text-[#466d4c] underline">Clear filters</button></div>}
          <ul className="grid gap-5 xl:grid-cols-2" aria-busy={Boolean(deletingId)}>
            {visibleBooks.map((book) => {
              const id = book.id ?? book._id;
              return (
                <li key={id} className={deletingId === id ? "pointer-events-none opacity-60" : ""}>
                  <BookCard
                    API_BASE={API_BASE}
                    accessToken={accessToken}
                    book={book}
                    onDelete={handleDelete}
                  />
                </li>
              );
            })}
          </ul></>
        )}
      </section>
    </main>
  );
}
