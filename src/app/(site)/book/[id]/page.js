"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Languages,
  PackageCheck,
  ShoppingCart,
  Tag,
} from "lucide-react";
import SignedS3Image from "@/app/components/SignedS3Image";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function formatPrice(value, currency = "INR") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PublishedBookPage() {
  const params = useParams();
  const { data: session } = useSession();
  const bookId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!bookId || !API) {
      setLoading(false);
      setError("The bookstore is not configured yet.");
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`${API}/books/public/${bookId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message || "This published book could not be found.");
        setBook(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "This published book could not be found.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [bookId]);

  const price = useMemo(
    () => formatPrice(book?.retailPrice, book?.currency),
    [book?.currency, book?.retailPrice],
  );

  async function addToCart() {
    if (!book || !price) return;
    setAdding(true);
    setError("");
    setNotice("");

    try {
      const token = session?.user?.accessToken;
      if (token) {
        const response = await fetch(`${API}/cart/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookId: book.id, qty: 1 }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message || "The book could not be added to your cart.");
      } else {
        const existing = JSON.parse(window.localStorage.getItem("guest_cart") || "[]");
        const index = existing.findIndex((item) => Number(item.bookId) === Number(book.id));
        if (index >= 0) {
          existing[index].qty = Number(existing[index].qty || 0) + 1;
        } else {
          existing.push({
            bookId: book.id,
            qty: 1,
            title: book.title,
            authorName: book.authorName,
            price: Number(book.retailPrice),
            coverUrl: book.frontCoverUrl || "",
          });
        }
        window.localStorage.setItem("guest_cart", JSON.stringify(existing));
        window.dispatchEvent(new Event("cart-updated"));
      }
      setNotice(session ? "Added to your cart." : "Saved in your cart. Sign in when you are ready to check out.");
    } catch (cartError) {
      setError(cartError.message || "The book could not be added to your cart.");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 sm:px-6">
        <div className="animate-pulse rounded-3xl bg-slate-100 p-10 text-slate-500">Opening the book…</div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-16 text-center sm:px-6">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Book unavailable</h1>
        <p className="mt-2 text-slate-600">{error || "This book is not in the published catalogue."}</p>
        <Link href="/bookstore" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-3 font-bold text-white hover:bg-blue-900">
          <ArrowLeft className="h-4 w-4" /> Browse published books
        </Link>
      </main>
    );
  }

  const author = [book.authorName, book.coAuthor].filter(Boolean).join(" with ");
  const attributes = [
    { label: "Language", value: book.language, icon: Languages },
    { label: "Genre", value: book.genre, icon: Tag },
    { label: "Format", value: book.design?.bindingType?.replaceAll("_", " "), icon: BookOpen },
    { label: "Trim size", value: book.design?.size?.replaceAll("_", " "), icon: PackageCheck },
  ].filter((item) => item.value);

  return (
    <main className="bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-14">
        <Link href="/bookstore" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" /> Back to bookstore
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)_300px] lg:gap-12">
          <div className="mx-auto w-full max-w-[360px]">
            <div className="aspect-[5/8] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xl">
              <SignedS3Image
                directUrl={book.frontCoverUrl}
                alt={`${book.title} front cover`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <article className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-800">Published book</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{book.title}</h1>
            {book.subheading && <p className="mt-3 text-xl leading-8 text-slate-600">{book.subheading}</p>}
            <p className="mt-5 text-lg font-semibold text-slate-800">by {author || "Independent author"}</p>

            {attributes.length > 0 && (
              <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                {attributes.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <Icon className="h-5 w-5 text-blue-800" />
                    <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-0.5 capitalize text-slate-800">{String(value).toLowerCase()}</dd></div>
                  </div>
                ))}
              </dl>
            )}

            <section className="mt-9 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-950">About this book</h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-700">{book.description || "The author has not added a description yet."}</p>
            </section>

            {book.authorBiography && (
              <section className="mt-8 border-t border-slate-200 pt-8">
                <h2 className="text-xl font-bold text-slate-950">About {book.authorName || "the author"}</h2>
                <p className="mt-3 whitespace-pre-wrap leading-8 text-slate-700">{book.authorBiography}</p>
              </section>
            )}

            {Array.isArray(book.categories) && book.categories.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2" aria-label="Book categories">
                {book.categories.map((category) => <span key={category} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{category}</span>)}
              </div>
            )}
          </article>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-lg lg:sticky lg:top-6">
            {price ? (
              <>
                <p className="text-sm text-slate-500">Paperback price</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{price}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Available to order</p>
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={adding}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3.5 font-bold text-white hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60"
                >
                  <ShoppingCart className="h-5 w-5" /> {adding ? "Adding…" : "Add to cart"}
                </button>
                <p className="mt-3 text-xs leading-5 text-slate-500">Delivery charges and the final total are shown at checkout.</p>
              </>
            ) : (
              <>
                <p className="font-bold text-slate-950">Ordering is not available yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">The author has not set a retail price for this edition.</p>
              </>
            )}
            {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          </aside>
        </div>
      </div>
    </main>
  );
}
