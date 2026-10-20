"use client";

import CoverArtwork from "@/app/components/cover/CoverArtwork";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function priceLabel(value, currency = "INR") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price coming soon";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BookCarousel({ heading = "Published books", limit }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!API) {
      setError("The bookstore is not configured yet.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    (async () => {
      try {
        const response = await fetch(`${API}/books/all`, { signal: controller.signal, cache: "no-store" });
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data?.message || "Published books could not be loaded.");
        setBooks(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") setError("Published titles are temporarily unavailable. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [retry]);

  const visibleBooks = typeof limit === "number" ? books.slice(0, limit) : books;

  return (
    <section className="ui-shell !py-6">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="ui-eyebrow">Nobel Books bookstore</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{heading}</h2>
        </div>
        <Link href="/bookstore" className="hidden items-center gap-2 text-sm font-bold text-blue-800 hover:text-blue-950 sm:inline-flex">View catalogue <ArrowRight className="h-4 w-4" /></Link>
      </div>

      {loading && (
        <div className={`grid grid-cols-2 gap-5 sm:grid-cols-3 ${limit === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
          {Array.from({ length: limit || 5 }).map((_, index) => <div key={index} className="aspect-[5/8] animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      )}

      {!loading && error && <div role="alert" className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600"><p>{error}</p><button onClick={() => setRetry(value => value + 1)} className="mt-3 font-semibold text-[#244d40] underline">Try again</button></div>}

      {!loading && !error && visibleBooks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">The first approved books will appear here.</p>
        </div>
      )}

      {!loading && !error && visibleBooks.length > 0 && (
        <div className={`grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 ${limit === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
          {visibleBooks.map((book) => (
            <Link key={book.id} href={`/book/${book.publicId || book.id}`} className="group min-w-0">
              <div className="aspect-[5/8] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-xl">
                {book.coverDesign ? <CoverArtwork design={book.coverDesign} alt={`${book.title} cover`} className="h-full w-full"/> : book.frontCoverUrl ? (
                  <img src={book.frontCoverUrl} alt={`${book.title} cover`} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-5 text-center text-slate-400"><BookOpen className="h-9 w-9" /><span className="mt-3 text-sm font-semibold">Cover coming soon</span></div>
                )}
              </div>
              <h3 className="mt-4 truncate text-base font-bold text-slate-950 group-hover:text-blue-800">{book.title || "Untitled"}</h3>
              <p className="mt-1 truncate text-sm text-slate-600">{book.authorName || "Independent author"}</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{priceLabel(book.retailPrice, book.currency)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
