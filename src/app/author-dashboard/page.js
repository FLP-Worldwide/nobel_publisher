"use client";

import BookCard from "../components/dashbaord/BookCard";
import UserHeroSection from "../components/dashbaord/UserHeroSection";
import { BookOpen, Loader2, Plus, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function AuthorDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user?.accessToken;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
  }, [accessToken, authHeaders, sessionStatus]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  async function handleDelete(id) {
    if (!API_BASE || !id) return;
    const book = books.find((item) => (item.id ?? item._id) === id);
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
      setBooks((current) => current.filter((item) => (item.id ?? item._id) !== id));
      setNotice("Book moved to trash.");
    } catch (deleteError) {
      setError(deleteError?.message || "Could not move the book to trash.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="ui-workspace">
      <UserHeroSection books={books} loading={loading} />

      <section className="ui-shell" aria-labelledby="your-books-heading">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ui-eyebrow">WORK IN PROGRESS</p>
            <h2 id="your-books-heading" className="mt-1 text-xl font-semibold text-slate-800">
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
          <ul className="grid gap-5 xl:grid-cols-2" aria-busy={Boolean(deletingId)}>
            {books.map((book) => {
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
          </ul>
        )}
      </section>
    </main>
  );
}
