"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Printer } from "lucide-react";
import BookPreview from "@/app/components/editor/BookPreview";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const FRONT_MATTER_NAMES = /^(dedication|foreword|preface|introduction)$/i;
const BACK_MATTER_NAMES = /^(back\s*matter|acknowledg(e)?ments|about\s+the\s+author|appendix|resources)$/i;

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

function normalizeBook(response, design, fallbackAuthor) {
  const book = response?.book || response || {};
  const chapters = Array.isArray(book.chapters) ? book.chapters : [];
  const frontmatter = [];
  const normalChapters = [];
  const backmatter = [];

  chapters.forEach((chapter) => {
    if (!chapter?.id && !chapter?.title) return;
    const title = chapter.title?.trim() || "Untitled section";
    const common = { id: chapter.id, title, content: chapter.content || "" };
    if (
      (["intro", "preface"].includes(chapter.type)) ||
      FRONT_MATTER_NAMES.test(title)
    ) {
      frontmatter.push({ ...common, type: "frontmatter" });
    } else if (BACK_MATTER_NAMES.test(title)) {
      backmatter.push({ ...common, type: "backmatter" });
    } else {
      normalChapters.push({ ...common, type: chapter.type === "section" ? "section" : "chapter" });
    }
  });

  return {
    title: book.title?.trim() || "Untitled book",
    subtitle: book.subheading?.trim() || "",
    author:
      [book.authorName, book.coAuthor].filter(Boolean).join(" & ") ||
      fallbackAuthor ||
      "Author",
    copyright: book.copyright || "",
    frontmatter,
    chapters: normalChapters.map((chapter, index) => ({ ...chapter, number: normalChapters.slice(0, index + 1).filter(c => c.type === "chapter").length })),
    language: book.language,
    backmatter,
    trimSize: design?.size || book?.design?.size || book?.bookDesign?.size,
    design: design || book?.design || book?.bookDesign || null,
    _raw: book,
  };
}

export default function PreviewPage({ params }) {
  const { bookId } = use(params);
  const { data: session, status } = useSession();
  const [previewBook, setPreviewBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const accessToken = session?.user?.accessToken;

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !accessToken) {
      setLoading(false);
      return;
    }
    if (!API_BASE || !bookId) {
      setError("The publishing service is not configured.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    async function loadPreview() {
      setLoading(true);
      setError("");
      try {
        const [bookResponse, designResponse] = await Promise.all([
          fetch(`${API_BASE}/books/${bookId}`, {
            headers: authHeaders(accessToken),
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/books/${bookId}/design`, {
            headers: authHeaders(accessToken),
            cache: "no-store",
            signal: controller.signal,
          }).catch(() => null),
        ]);
        if (!bookResponse.ok) {
          if (bookResponse.status === 401 || bookResponse.status === 403) {
            throw new Error("You do not have access to this manuscript.");
          }
          throw new Error("The saved manuscript could not be loaded.");
        }
        const bookData = await bookResponse.json();
        const designData = designResponse?.ok ? await designResponse.json() : null;
        setPreviewBook(normalizeBook(bookData, designData, session?.user?.name));
      } catch (loadError) {
        if (loadError?.name !== "AbortError") {
          setError(loadError?.message || "The saved manuscript could not be loaded.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadPreview();
    return () => controller.abort();
  }, [accessToken, bookId, session?.user?.name, status]);

  if (status === "loading" || loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 text-slate-600">
        <div className="flex items-center gap-3" role="status">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading the complete saved manuscript…
        </div>
      </main>
    );
  }

  if (status !== "authenticated" || !accessToken) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <BookOpen className="mx-auto h-10 w-10 text-blue-600" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Sign in to review this book</h1>
          <p className="mt-2 text-sm text-slate-600">The preview contains private manuscript content from your author account.</p>
          <Link href={`/login?callbackUrl=${encodeURIComponent(`/write/tool/step2/${bookId}/canva/preview`)}`} className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="book-preview-controls sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="flex w-full items-center gap-3">
          <Link href={`/write/tool/step2/${bookId}/canva`} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to editor</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-semibold text-slate-900">{previewBook?.title || "Book review"}</p>
            <p className="truncate text-xs text-slate-500">Review every section before continuing</p>
          </div>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Print review</span>
          </button>
          <Link href={`/write/tool/step2/${bookId}`} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:px-4">
            Continue
          </Link>
        </div>
      </header>

      {error ? (
        <main className="mx-auto max-w-xl px-5 py-16 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Preview unavailable</h1>
          <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>
          <Link href={`/write/tool/step2/${bookId}/canva`} className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Return to editor</Link>
        </main>
      ) : previewBook ? (
        <BookPreview book={previewBook} />
      ) : null}
    </div>
  );
}
