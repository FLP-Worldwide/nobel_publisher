"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AuthorSidebar from "@/app/components/dashbaord/AuthorSidebar";
import AuthorTopbar from "@/app/components/dashbaord/Topbar";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const DRAFT_KEY = "write_tool_new_book_draft_v2";
const CURRENT_BOOK_ID = "current_book_id";

export default function WriteTool() {
  const router = useRouter();
  const search = useSearchParams();
  
  const routeParams = useParams(); // ✅ replaces reading `{ params }` from props
  const segmentId = Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id;

  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken;

  // --- get id from query (?id=) or from route segment (/write/tool/[id]) ---
  const idFromUrl = search?.get("id") || segmentId || null;

  console.log("WriteTool: idFromUrl =", idFromUrl, "; segmentId =", segmentId);
  const [bookId, setBookId] = useState(idFromUrl || "");

  useEffect(() => {
    // Keep state in sync with URL
    if (idFromUrl && bookId !== idFromUrl) setBookId(idFromUrl);

    // Persist when present
    if (idFromUrl) {
      try { localStorage.setItem(CURRENT_BOOK_ID, idFromUrl); } catch {}
      return;
    }

    // Fallback to localStorage when no id in URL
    // if (!bookId) {
    //   try {
    //     const stored = localStorage.getItem(CURRENT_BOOK_ID);
    //     if (stored) setBookId(stored);
    //   } catch {}
    // }
  }, [idFromUrl, bookId]);


  // Form state
  const [title, setTitle] = useState("");
  const [subheading, setSubheading] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [coAuthor, setCoAuthor] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedGenre, setSelectedGenre] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const languages = useMemo(
    () => [
      { name: "English" },
      { name: "हिंदी" },
      { name: "தமிழ்" },
      { name: "മലയാളം" },
      { name: "বাংলা" },
      { name: "मराठी" },
      { name: "ಕನ್ನಡ" },
      { name: "ગુજરાતી" },
    ],
    []
  );

  const genres = useMemo(
    () => [
      { name: "Fiction" },
      { name: "Non-Fiction" },
      { name: "Academic" },
      { name: "Poetry" },
      { name: "Cookbook" },
      { name: "Children Book" },
      { name: "Others" },
    ],
    []
  );

  // ------ Restore draft only when no bookId yet ------
  useEffect(() => {
    if (bookId) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setTitle(d.title ?? "");
        setSubheading(d.subheading ?? "");
        setAuthorName(d.authorName ?? "");
        setCoAuthor(d.coAuthor ?? "");
        setSelectedLanguage(d.selectedLanguage ?? "English");
        setSelectedGenre(d.selectedGenre ?? "");
      }
    } catch {}
  }, [bookId]);

  useEffect(() => {
    if (bookId) return; // only draft before creation
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            title,
            subheading,
            authorName,
            coAuthor,
            selectedLanguage,
            selectedGenre,
          })
        );
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [bookId, title, subheading, authorName, coAuthor, selectedLanguage, selectedGenre]);

  // -------- SWR (active after we have a bookId) --------
  const canFetch = useMemo(
    () => Boolean(API_BASE && bookId && status !== "loading"),
    [API_BASE, bookId, status]
  );

  const swrKey = canFetch ? [`${API_BASE}/books/${bookId}`, accessToken] : null;

  const fetcher = async ([url, token]) => {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      throw new Error(result?.message || `Could not load this book (${res.status})`);
    }
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
  });


  // hydrate form from server (update/edit mode)
  useEffect(() => {
    if (!data) return;
    setTitle(data?.title ?? "");
    setSubheading(data?.subheading ?? "");
    setAuthorName(data?.authorName ?? "");
    setCoAuthor(data?.coAuthor ?? "");
    setSelectedLanguage(data?.language ?? "English");
    setSelectedGenre(data?.genre ?? "");
  }, [data]);

  // -------- Submit (create or update) --------
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!title.trim()) return setMsg("❌ Book title is required.");
    if (!authorName.trim()) return setMsg("❌ Author name is required.");
    if (!selectedLanguage) return setMsg("❌ Please select a language.");
    if (!selectedGenre) return setMsg("❌ Please select a genre.");

    if (status === "loading") return setMsg("Checking your session…");
    if (!accessToken) return setMsg("❌ You must be logged in as an author.");
    if (!API_BASE) return setMsg("❌ NEXT_PUBLIC_API_URL is not configured.");

    setLoading(true);
    try {
      const payload = {
        title,
        language: selectedLanguage,
        authorName,
        subheading,
        coAuthor: coAuthor || null,
        genre: selectedGenre,
      };

      if (!bookId) {
        // CREATE
        const res = await fetch(`${API_BASE}/books`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || `Failed to create (${res.status})`);

        const newId = json?.id || json?._id;
        setBookId(newId);

        // persist id so refresh works
        try { localStorage.setItem(CURRENT_BOOK_ID, newId); } catch {}

        // drop the local draft now that server is source of truth
        try { localStorage.removeItem(DRAFT_KEY); } catch {}

        // put id into the URL without leaving the page
        router.replace(`?id=${encodeURIComponent(newId)}`);

        setMsg("✅ Book created. You can continue editing or proceed to design.");
      } else {
        // UPDATE
        await mutate(
          async () => {
            const res = await fetch(`${API_BASE}/books/${bookId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.message || `Failed to update (${res.status})`);
            return { ...(data || {}), ...payload };
          },
          { revalidate: true }
        );
        setMsg("✅ Changes saved.");
      }
    } catch (err) {
      setMsg(`❌ ${err?.message || "Server error. Please try again."}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="lg:ml-64">
        <AuthorTopbar />
        <AuthorSidebar currentStep="information" />

        <section className="bg-white ">
          <div className="py-8 px-4 mx-auto max-w-full lg:py-16">
            <h1 className="text-2xl font-bold mb-2">Book Informations</h1>
            <h2 className="mb-4 text-xl font-bold text-gray-900 ">
              Enter all the information about your book - Its language, title and author(s)
            </h2>

            {status === "loading" && (
              <div className="mb-4 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                Checking session…
              </div>
            )}
            {error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error.message}
              </div>
            )}
            {msg && (
              <div
                className={`mb-4 rounded border px-3 py-2 text-sm ${
                  msg.startsWith("✅")
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-1 sm:gap-6">
                {/* Language */}
                <div className="mb-2">
                  <label className="block text-lg font-bold text-gray-900  mb-2">
                    Book Language <span className="text-red-500">*</span>
                  </label>
                  <p className="mb-3 text-gray-600 ">
                    Primary language in which your book has been written. In case of bi-lingual or multi-lingual, choose the language that is used the most.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {languages.map((lang) => (
                      <button
                        type="button"
                        key={lang.name}
                        onClick={() => setSelectedLanguage(lang.name)}
                        className={`relative px-5 py-2 rounded-lg border text-lg font-medium transition 
                          ${selectedLanguage === lang.name
                            ? "bg-blue-50 border-blue-500 text-blue-800"
                            : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-lg font-bold text-gray-900 ">
                    Book Title
                  </label>
                  <p className="mb-2">
                    Choose a unique title. You can use amazon.com to check if your title has already been taken.
                  </p>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Enter book title"
                    required
                  />
                </div>

                {/* Subtitle */}
                <div className="sm:col-span-2">
                  <label htmlFor="subheading" className="block text-lg font-bold text-gray-900 ">
                    Book Subtitle
                  </label>
                  <p className="mb-2">
                    Subtitle gives more clarity about your book to readers. Recommended for Non-Fiction books
                  </p>
                  <input
                    type="text"
                    name="subheading"
                    id="subheading"
                    value={subheading}
                    onChange={(e) => setSubheading(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                    placeholder="Enter book subtitle"
                  />
                </div>

                {/* Author */}
                <div className="sm:col-span-2">
                  <label htmlFor="authorName" className="block text-lg font-bold text-gray-900 ">
                    Author
                  </label>
                  <p className="mb-2">
                    Author name that would go on the book cover. If you write under Pseudonym, mention that as the author name here.
                  </p>
                  <input
                    type="text"
                    name="authorName"
                    id="authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                    placeholder="Enter author name"
                    required
                  />
                </div>

                {/* Co-Author (optional) */}
                <div className="sm:col-span-2">
                  <label htmlFor="coAuthor" className="block text-lg font-bold text-gray-900 ">
                    Co-Author (optional)
                  </label>
                  <input
                    type="text"
                    name="coAuthor"
                    id="coAuthor"
                    value={coAuthor}
                    onChange={(e) => setCoAuthor(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                    placeholder="Enter co-author name"
                  />
                </div>

                {/* Genre */}
                <div className="sm:col-span-2">
                  <label className="block text-lg font-bold text-gray-900 ">
                    Book Genre <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {genres.map((g) => (
                      <button
                        type="button"
                        key={g.name}
                        onClick={() => setSelectedGenre(g.name)}
                        className={`relative px-5 py-2 rounded-lg border text-lg font-medium transition 
                          ${selectedGenre === g.name
                            ? "bg-blue-50 border-blue-500 text-blue-800"
                            : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"}`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || status === "loading" || isLoading}
                  className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : bookId ? "Save changes" : "Save & create"}
                </button>

                <button
                  type="button"
                  disabled={!bookId}
                  onClick={() => router.push(`/write/tool/step2/${bookId}`)}
                  className="inline-flex items-center px-4 py-2 mt-4 sm:mt-6 text-sm font-medium text-blue-900 border border-blue-900 rounded-lg hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Continue to Design
                </button>
              </div>
            </form>
          </div>
        </section>
      </section>
    </>
  );
}
