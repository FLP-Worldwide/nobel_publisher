"use client";
import BookEditGuard from "@/app/components/dashbaord/BookEditGuard";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AuthorSidebar from "@/app/components/dashbaord/AuthorSidebar";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const DRAFT_KEY = "write_tool_new_book_draft_v2";
const CURRENT_BOOK_ID = "current_book_id";

function WriteTool() {
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
    <div className="ui-workspace">
      <AuthorSidebar currentStep="information" />
      <main className="ui-shell">
        <header className="ui-heading"><div><p className="ui-eyebrow">01 / Book essentials</p><h1>The brief</h1><p>A few details to give your book its identity. You can refine these before review.</p></div><span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">{bookId ? 'Draft in progress' : 'New book'}</span></header>
        {status === 'loading' && <p role="status" className="mb-4 text-sm text-slate-500">Checking your account…</p>}
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error.message}</p>}
        {msg && <p role={msg.startsWith('✅') ? 'status' : 'alert'} className={`mb-4 rounded-lg border p-3 text-sm ${msg.startsWith('✅') ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{msg}</p>}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <section className="ui-card">
              <h2>Title & identity</h2><p className="ui-help">The name readers will see on your cover and in the bookshop.</p>
              <div className="mt-5"><label htmlFor="title" className="ui-label">Book title <span className="text-red-600">*</span></label><input id="title" name="title" value={title} onChange={e=>setTitle(e.target.value)} className="ui-field" placeholder="Give your story a name" required /></div>
              <div className="mt-4"><label htmlFor="subheading" className="ui-label">Subtitle <span className="font-normal text-slate-400">· optional</span></label><input id="subheading" name="subheading" value={subheading} onChange={e=>setSubheading(e.target.value)} className="ui-field" placeholder="A short line that adds context" /></div>
            </section>
            <section className="ui-card"><h2>People behind the book</h2><p className="ui-help">Use your name or the pen name you want printed on the cover.</p><div className="ui-form-columns mt-5">
              <div><label htmlFor="authorName" className="ui-label">Author name <span className="text-red-600">*</span></label><input id="authorName" name="authorName" value={authorName} onChange={e=>setAuthorName(e.target.value)} className="ui-field" placeholder="Author or pen name" required /></div>
              <div><label htmlFor="coAuthor" className="ui-label">Co-author <span className="font-normal text-slate-400">· optional</span></label><input id="coAuthor" name="coAuthor" value={coAuthor} onChange={e=>setCoAuthor(e.target.value)} className="ui-field" placeholder="Co-author name" /></div>
            </div></section>
            <section className="ui-card"><h2>Language & genre</h2><p className="ui-help">For a multilingual book, choose the language used most.</p>
              <fieldset className="mt-5"><legend className="ui-label">Primary language</legend><div className="flex flex-wrap gap-2">{languages.map(lang=><button key={lang.name} type="button" className="ui-choice" aria-pressed={selectedLanguage===lang.name} onClick={()=>setSelectedLanguage(lang.name)}>{lang.name}</button>)}</div></fieldset>
              <fieldset className="mt-5"><legend className="ui-label">Genre</legend><div className="flex flex-wrap gap-2">{genres.map(g=><button key={g.name} type="button" className="ui-choice" aria-pressed={selectedGenre===g.name} onClick={()=>setSelectedGenre(g.name)}>{g.name}</button>)}</div></fieldset>
            </section>
            <div className="ui-actions"><p className="ui-help">Your draft stays private until publication.</p><div className="flex flex-wrap gap-2"><button type="submit" disabled={loading || status==='loading' || isLoading} className="ui-button">{loading ? 'Saving…' : bookId ? 'Save details' : 'Create book'}</button><button type="button" disabled={!bookId} onClick={()=>router.push(`/write/tool/step2/${bookId}`)} className="ui-button ui-button-secondary">Book studio →</button></div></div>
          </form>
          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="bg-[#19334c] px-5 py-6 text-white"><p className="text-[10px] uppercase tracking-widest text-slate-300">Your book at a glance</p><h2 className="mt-5 break-words text-xl font-semibold leading-snug">{title || 'Your book title'}</h2>{subheading && <p className="mt-2 break-words text-xs leading-5 text-slate-300">{subheading}</p>}<p className="mt-6 text-xs text-slate-300">{authorName || 'Your name'}</p></div><dl className="grid grid-cols-2 gap-4 p-5 text-xs"><div><dt className="text-slate-400">Language</dt><dd className="mt-1 font-medium text-slate-700">{selectedLanguage || 'Not chosen'}</dd></div><div><dt className="text-slate-400">Genre</dt><dd className="mt-1 font-medium text-slate-700">{selectedGenre || 'Not chosen'}</dd></div></dl></section>
            <section className="ui-card"><h2>Up next</h2><p className="ui-help">Choose your print format, write your manuscript and add cover artwork in the book studio.</p><div className="mt-4 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">Editorial review comes first. The one-time ₹199 publishing fee is due only after approval.</div></section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function ProtectedBookPage() {
 const p = useParams(); const search = useSearchParams(); const raw = p?.bookId ?? p?.id ?? search.get("id"); const id = Array.isArray(raw) ? raw[0] : raw;
 return <BookEditGuard bookId={id}><WriteTool /></BookEditGuard>;
}
