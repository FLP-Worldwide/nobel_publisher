"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookCheck, CheckCircle2, MessageSquareWarning } from "lucide-react";
import SignedS3Image from "@/app/components/SignedS3Image";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function plainText(html = "") {
  return String(html)
    .replace(/<(script|style|iframe|object)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wordsIn(html = "") {
  return plainText(html).trim().split(/\s+/).filter(Boolean).length;
}

export default function ReviewBookPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const bookId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [book, setBook] = useState(null);
  const [review, setReview] = useState(null);
  const [revision, setRevision] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !bookId || !API) return;
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`${API}/reviews/${bookId}`, {
          cache: "no-store",
          signal: controller.signal,
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message || "Could not open this submission.");
        const snapshot = data.revision?.snapshot || {};
        setBook({
          ...(data.book || {}),
          ...(snapshot.book || {}),
          design: snapshot.design || data.book?.design || null,
          chapters: Array.isArray(snapshot.chapters) ? snapshot.chapters : [],
        });
        setReview(data.review || null);
        setRevision(data.revision || null);
        setNotes(data.review?.reviewerNotes || "");
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Could not open this submission.");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [bookId, session?.user?.accessToken, status]);

  const sections = useMemo(() => {
    const chapters = Array.isArray(book?.chapters) ? [...book.chapters] : [];
    return chapters.sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [book?.chapters]);
  const totalWords = useMemo(() => sections.reduce((sum, chapter) => sum + wordsIn(chapter.content), 0), [sections]);
  const reviewIsOpen = review?.status === "SUBMITTED";

  async function decide(kind) {
    if (kind === "request-changes" && notes.trim().length < 5) {
      setError("Add a clear note explaining what the author needs to change.");
      return;
    }
    setAction(kind);
    setError("");
    try {
      const response = await fetch(`${API}/reviews/${bookId}/${kind}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ notes: notes.trim() || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "The review decision could not be saved.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message || "The review decision could not be saved.");
      setAction("");
    }
  }

  if (loading) return <main className="mx-auto max-w-[1200px] px-4 py-16 text-slate-600">Opening the complete submission…</main>;
  if (!book) return <main className="mx-auto max-w-[1200px] px-4 py-16"><p role="alert" className="text-red-700">{error || "Submission not found."}</p></main>;

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" /> Back to queue
        </Link>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Revision {revision?.version || "—"}</span><span aria-hidden="true">·</span><span>{sections.length} sections</span><span aria-hidden="true">·</span><span>{totalWords.toLocaleString("en-IN")} words</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 xl:sticky xl:top-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Contents</p>
          <nav aria-label="Manuscript sections" className="max-h-[70vh] space-y-1 overflow-auto pr-1">
            <a href="#book-details" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100">Book details</a>
            {sections.map((section, index) => {
              const sectionId = section.sourceChapterId || index;
              return (
              <a key={sectionId} href={`#section-${sectionId}`} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                <span className="mr-2 text-xs text-slate-400">{index + 1}</span>{section.title || `Section ${index + 1}`}
              </a>
            )})}
          </nav>
        </aside>

        <article className="min-w-0 space-y-5">
          <section id="book-details" className="scroll-mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[120px_minmax(0,1fr)]">
              <div className="aspect-[5/8] overflow-hidden rounded-lg bg-slate-100 shadow-sm">
                <SignedS3Image
                  s3Key={book.frontCoverKey}
                  directUrl={book.frontCoverUrl}
                  accessToken={session?.user?.accessToken}
                  alt={`${book.title} front cover`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{String(review?.status || book.status || "SUBMITTED").replaceAll("_", " ")}</span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{book.title}</h1>
                {book.subheading && <p className="mt-2 text-lg text-slate-600">{book.subheading}</p>}
                <p className="mt-4 font-semibold">{[book.authorName, book.coAuthor].filter(Boolean).join(" with ")}</p>
                <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 text-sm sm:grid-cols-3">
                  <div><dt className="text-slate-500">Language</dt><dd className="font-semibold">{book.language || "—"}</dd></div>
                  <div><dt className="text-slate-500">Genre</dt><dd className="font-semibold">{book.genre || "—"}</dd></div>
                  <div><dt className="text-slate-500">Trim size</dt><dd className="font-semibold">{book.design?.size?.replaceAll("_", " ") || "—"}</dd></div>
                  <div><dt className="text-slate-500">Binding</dt><dd className="font-semibold">{book.design?.bindingType || "—"}</dd></div>
                  <div><dt className="text-slate-500">Interior</dt><dd className="font-semibold">{book.design?.interior?.replaceAll("_", " ") || "—"}</dd></div>
                  <div><dt className="text-slate-500">Paper</dt><dd className="font-semibold">{book.design?.paperType?.replaceAll("_", " ") || "—"}</dd></div>
                </dl>
              </div>
            </div>
            {(book.bookDescription || book.description) && (
              <div className="mt-8 border-t border-slate-200 pt-6"><h2 className="font-bold">Book description</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">{book.bookDescription || book.description}</p></div>
            )}
          </section>

          {sections.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">This submission has no manuscript sections.</section>
          ) : sections.map((section, index) => {
            const sectionId = section.sourceChapterId || index;
            return (
            <section key={sectionId} id={`section-${sectionId}`} className="scroll-mt-5 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Section {index + 1} · {section.type || "chapter"}</p>
              <h2 className="mt-3 border-b border-slate-200 pb-5 font-serif text-3xl font-bold">{section.title || `Section ${index + 1}`}</h2>
              <div className="mt-7 whitespace-pre-wrap font-serif text-[17px] leading-8 text-slate-800">{plainText(section.content) || "No content supplied."}</div>
            </section>
          )})}
        </article>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-4">
          <div className="mb-4 flex items-center gap-2"><BookCheck className="h-5 w-5 text-blue-800" /><h2 className="font-bold">{reviewIsOpen ? "Review decision" : "Decision recorded"}</h2></div>
          <label htmlFor="review-notes" className="text-sm font-semibold text-slate-700">Notes for the author</label>
          <textarea
            id="review-notes"
            rows={8}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            readOnly={!reviewIsOpen}
            placeholder="Be specific and actionable. Approval notes are optional; change requests require a reason."
            className="mt-2 w-full resize-y rounded-xl border border-slate-300 p-3 text-sm outline-none read-only:bg-slate-50 read-only:text-slate-600 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />
          {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {reviewIsOpen ? (
            <>
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => decide("approve")}
                  disabled={Boolean(action)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" /> {action === "approve" ? "Approving…" : "Approve for ₹199 payment"}
                </button>
                <button
                  type="button"
                  onClick={() => decide("request-changes")}
                  disabled={Boolean(action)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                >
                  <MessageSquareWarning className="h-4 w-4" /> {action === "request-changes" ? "Sending…" : "Request changes"}
                </button>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">Approval unlocks the author&apos;s fixed ₹199 publishing fee. It does not publish the book until payment is verified.</p>
            </>
          ) : (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              This revision is <strong>{String(review?.status || "complete").replaceAll("_", " ").toLowerCase()}</strong>. Its decision and manuscript snapshot are preserved for review history.
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
