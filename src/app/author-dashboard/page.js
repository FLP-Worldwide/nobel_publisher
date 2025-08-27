"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserHeroSection from "../components/dashbaord/UserHeroSection";
import BookCard from "../components/dashbaord/BookCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AuthorDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const authHeaders = useCallback(() => {
    const base = { "Content-Type": "application/json" };
    return accessToken ? { ...base, Authorization: `Bearer ${accessToken}` } : base;
  }, [accessToken]);

  const fetchBooks = useCallback(async () => {
    if (!API_BASE) {
      setErr("API base URL is not configured. Set NEXT_PUBLIC_API_URL in your env.");
      setLoading(false);
      return;
    }
    try {
      setErr("");
      setLoading(true);
      const res = await fetch(`${API_BASE}/books`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load books: ${res.status}`);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch books error:", e);
      setErr(e?.message || "Failed to load books");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    // Wait until NextAuth knows whether we're logged in to avoid 401 flashes.
    if (status === "loading") return;
    // If your /books endpoint allows public reads, this still works when unauthenticated.
    fetchBooks();
  }, [status, accessToken, fetchBooks]);

  async function handleDelete(id) {
    if (!API_BASE) return alert("Missing NEXT_PUBLIC_API_URL");
    const ok = window.confirm("Delete this book permanently?");
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/books/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include", // keep if your API uses cookies in addition to Bearer
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      await fetchBooks();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to delete book");
    } finally {
      setLoading(false);
    }
  }

  function handleContinue(id) {
    router.push(`/write/tool/${id}`);
  }

  return (
    <>
      <UserHeroSection />

      {/* Ads Section */}
      <div className="px-8 mb-4">
        <img
          src="https://notionpress.com/new-rewamp/images/weekly_contest/IAC_Sep_25/21_IAC_Web_Banner_May_27.webp"
          alt="Contest banner"
        />
      </div>
      <div className="mt-8 px-8 mb-4">
        <img
          className="w-full"
          src="https://notionpress.com/new-rewamp/images/write_contest/story_dashboard_banner.png"
          alt="Story dashboard banner"
        />
      </div>

      <section className="w-full flex justify-center">
        <div className="w-full max-w-6xl px-6">
          <div className="flex items-center gap-5 mb-6">
            <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-extrabold">
              Books
            </h2>

            <button
              onClick={() => router.push("write/tool")}
              className="bg-blue-500 text-white px-8 py-3 font-semibold rounded-lg text-lg flex items-center gap-2 shadow-[8px_8px_0px_black] hover:bg-blue-600 transition"
            >

              Start a New Book →
            </button>
          </div>

          {err && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
              {err}
            </div>
          )}

          {loading ? (
            <div className="animate-pulse text-gray-600">Loading books…</div>
          ) : books.length === 0 ? (
            <div className="text-gray-600">No books yet. Start your first one!</div>
          ) : (
            <ul className="space-y-4">
              {books.map((b) => (
                <li key={b.id || b._id}>
                  <BookCard
                    API_BASE={API_BASE}
                    accessToken={accessToken}
                    book={b}
                    onDelete={handleDelete}
                    onContinue={handleContinue}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
