"use client";

import AuthorSidebar from "@/app/components/dashbaord/AuthorSidebar";
import AuthorTopbar from "@/app/components/dashbaord/Topbar";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Eye,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const DESCRIPTION_LIMIT = 1500;
const BIOGRAPHY_LIMIT = 2500;
const MAX_KEYWORDS = 7;
const MAX_CATEGORIES = 3;

const CATEGORY_OPTIONS = [
  "Fiction",
  "Non-Fiction",
  "Romance",
  "Thriller & Mystery",
  "Fantasy",
  "Poetry",
  "Biography & Memoir",
  "Self-Help",
  "Business",
  "Academic",
  "Children's Books",
  "Cookbooks",
];

const LOCKED_STATUSES = new Set([
  "IN_REVIEW",
  "APPROVED",
  "PAYMENT_PENDING",
  "PUBLISHED",
  "REJECTED",
  "INACTIVE",
]);

function splitKeywords(value) {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .filter((keyword, index, keywords) => keywords.indexOf(keyword) === index);
}

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const issues = Array.isArray(body?.issues) ? body.issues.join(" ") : "";
    throw new Error(issues || body?.message || `Request failed (${response.status})`);
  }
  return body;
}

export default function Metadata() {
  const router = useRouter();
  const params = useParams();
  const bookId = Array.isArray(params?.bookId) ? params.bookId[0] : params?.bookId;
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user?.accessToken;

  const [book, setBook] = useState(null);
  const [description, setDescription] = useState("");
  const [authorBiography, setAuthorBiography] = useState("");
  const [categories, setCategories] = useState([]);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [authorMessage, setAuthorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }),
    [accessToken]
  );

  const loadBook = useCallback(async () => {
    if (sessionStatus === "loading") return;
    if (!API_BASE) {
      setNotice({ type: "error", text: "The publishing service is not configured." });
      setLoading(false);
      return;
    }
    if (!accessToken) {
      setNotice({ type: "error", text: "Please sign in to edit this book." });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/books/${bookId}`, {
        headers: authHeaders,
        cache: "no-store",
      });
      const data = await readJson(response);
      setBook(data);
      setDescription(data?.description || "");
      setAuthorBiography(data?.authorBiography || "");
      setCategories(Array.isArray(data?.categories) ? data.categories : []);
      setKeywordsInput(
        Array.isArray(data?.keywords) ? data.keywords.join(", ") : data?.keywords || ""
      );
      setTermsAccepted(Boolean(data?.termsAccepted ?? data?.termsAcceptedAt));
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Could not load this book." });
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeaders, bookId, sessionStatus]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  const rawStatus = String(book?.status || "DRAFT").toUpperCase();
  const isLocked = LOCKED_STATUSES.has(rawStatus);
  const keywords = splitKeywords(keywordsInput);
  const hasTooManyKeywords = keywords.length > MAX_KEYWORDS;

  function toggleCategory(category) {
    if (isLocked) return;
    setCategories((current) => {
      if (current.includes(category)) return current.filter((item) => item !== category);
      if (current.length >= MAX_CATEGORIES) return current;
      return [...current, category];
    });
  }

  function validateForSave() {
    if (description.length > DESCRIPTION_LIMIT) {
      return `Book description must be ${DESCRIPTION_LIMIT.toLocaleString("en-IN")} characters or fewer.`;
    }
    if (authorBiography.length > BIOGRAPHY_LIMIT) {
      return `Author biography must be ${BIOGRAPHY_LIMIT.toLocaleString("en-IN")} characters or fewer.`;
    }
    if (hasTooManyKeywords) return `Use no more than ${MAX_KEYWORDS} keywords.`;
    return "";
  }

  function validateForSubmission() {
    const saveError = validateForSave();
    if (saveError) return saveError;
    if (!description.trim()) return "Add a book description before submitting.";
    if (!authorBiography.trim()) return "Add an author biography before submitting.";
    if (categories.length === 0) return "Choose at least one category before submitting.";
    if (keywords.length === 0) return "Add at least one keyword before submitting.";
    if (!termsAccepted) return "Accept the publishing declaration before submitting.";
    return "";
  }

  async function saveMetadata({ showSuccess = true } = {}) {
    const validationError = validateForSave();
    if (validationError) throw new Error(validationError);
    if (!accessToken) throw new Error("Please sign in to save this book.");

    const response = await fetch(`${API_BASE}/books/${bookId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        description: description.trim(),
        authorBiography: authorBiography.trim(),
        categories,
        keywords,
        termsAccepted,
      }),
    });
    const updatedBook = await readJson(response);
    setBook(updatedBook);
    if (showSuccess) {
      setNotice({ type: "success", text: "Draft saved. You can return and continue later." });
    }
    return updatedBook;
  }

  async function handleSave() {
    setNotice(null);
    setSaving(true);
    try {
      await saveMetadata();
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Could not save your draft." });
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);

    const validationError = validateForSubmission();
    if (validationError) {
      setNotice({ type: "error", text: validationError });
      return;
    }

    setSubmitting(true);
    try {
      await saveMetadata({ showSuccess: false });
      const response = await fetch(`${API_BASE}/books/${bookId}/submit-review`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ message: authorMessage.trim() || undefined }),
      });
      await readJson(response);
      router.push(`/write/tool/step2/${bookId}/pricing_info`);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Could not submit this book." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 lg:ml-64">
      <AuthorTopbar />
      <AuthorSidebar currentStep="metadata" />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={`/write/tool/step2/${bookId}`}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to book setup
            </Link>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-blue-700">
              Final details
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Prepare your book for review
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Add the information readers will see, preview the complete book, then send one saved
              version to our review team.
            </p>
          </div>
          <Link
            href={`/write/tool/step2/${bookId}/canva/preview`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-300 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Preview complete book
          </Link>
        </div>

        {notice && (
          <div
            role={notice.type === "error" ? "alert" : "status"}
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {notice.text}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-blue-700" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-600">Loading your book details…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {isLocked && (
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">This submitted version is locked</p>
                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    Its status is {rawStatus.replaceAll("_", " ").toLowerCase()}. Open Review &amp;
                    publish to see the latest decision or payment step.
                  </p>
                </div>
              </div>
            )}

            <fieldset disabled={isLocked || saving || submitting} className="space-y-6 disabled:opacity-75">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">Book description</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Write a clear back-cover pitch that introduces the promise of your book without
                      giving everything away.
                    </p>
                  </div>
                </div>
                <label htmlFor="book-description" className="sr-only">
                  Book description
                </label>
                <textarea
                  id="book-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={7}
                  maxLength={DESCRIPTION_LIMIT}
                  placeholder="What is your book about, and why will readers want to keep reading?"
                  className="block w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-2 text-right text-xs font-medium text-slate-500">
                  {description.length.toLocaleString("en-IN")} / {DESCRIPTION_LIMIT.toLocaleString("en-IN")}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-xl font-bold text-slate-950">About the author</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Share the experience, perspective, or background that helps readers connect with you.
                </p>
                <label htmlFor="author-biography" className="sr-only">
                  Author biography
                </label>
                <textarea
                  id="author-biography"
                  value={authorBiography}
                  onChange={(event) => setAuthorBiography(event.target.value)}
                  rows={6}
                  maxLength={BIOGRAPHY_LIMIT}
                  placeholder="Introduce yourself to your readers…"
                  className="mt-5 block w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-2 text-right text-xs font-medium text-slate-500">
                  {authorBiography.length.toLocaleString("en-IN")} / {BIOGRAPHY_LIMIT.toLocaleString("en-IN")}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">Categories</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Choose up to {MAX_CATEGORIES} categories that best describe your book.
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-500">
                    {categories.length} / {MAX_CATEGORIES} selected
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Book categories">
                  {CATEGORY_OPTIONS.map((category) => {
                    const selected = categories.includes(category);
                    const unavailable = !selected && categories.length >= MAX_CATEGORIES;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        disabled={unavailable}
                        aria-pressed={selected}
                        className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? "border-blue-700 bg-blue-700 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-800"
                        }`}
                      >
                        {selected && <Check className="h-4 w-4" aria-hidden="true" />}
                        {category}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <label htmlFor="keywords" className="text-xl font-bold text-slate-950">
                      Search keywords
                    </label>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Add up to {MAX_KEYWORDS} phrases, separated by commas. Think of what a reader
                      would type while looking for your book.
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${hasTooManyKeywords ? "text-red-700" : "text-slate-500"}`}>
                    {keywords.length} / {MAX_KEYWORDS} keywords
                  </p>
                </div>
                <input
                  type="text"
                  id="keywords"
                  value={keywordsInput}
                  onChange={(event) => setKeywordsInput(event.target.value)}
                  placeholder="found family, Indian fantasy, coming of age"
                  aria-describedby="keyword-help"
                  aria-invalid={hasTooManyKeywords}
                  className="mt-5 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
                <p id="keyword-help" className="mt-2 text-xs text-slate-500">
                  Multi-word phrases count as one keyword when separated by commas.
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-xl font-bold text-slate-950">Publishing declaration</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                    I own the rights needed to publish this work and it does not unlawfully copy another work.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                    The book does not contain unlawful, defamatory, or intentionally misleading material.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                    I understand this saved version will be locked while the review is in progress.
                  </li>
                </ul>
                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span className="text-sm font-semibold leading-6 text-slate-800">
                    I confirm the statements above and agree to submit this version for review.
                  </span>
                </label>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <label htmlFor="author-message" className="text-xl font-bold text-slate-950">
                  Note for the reviewer <span className="text-sm font-normal text-slate-500">(optional)</span>
                </label>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Mention anything the reviewer should know about this edition, formatting, or special content.
                </p>
                <textarea
                  id="author-message"
                  value={authorMessage}
                  onChange={(event) => setAuthorMessage(event.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Add a short note…"
                  className="mt-5 block w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </section>
            </fieldset>

            <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:static sm:mx-0 sm:flex sm:items-center sm:justify-between sm:rounded-2xl sm:border sm:px-5 sm:shadow-sm">
              <p className="mb-3 text-sm leading-6 text-slate-600 sm:mb-0 sm:max-w-md">
                No payment is due now. After approval, you will pay the one-time ₹199 publishing fee.
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLocked || saving || submitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                  {saving ? "Saving…" : "Save draft"}
                </button>
                {isLocked ? (
                  <Link
                    href={`/write/tool/step2/${bookId}/pricing_info`}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    View review status
                  </Link>
                ) : (
                  <button
                    type="submit"
                    disabled={saving || submitting}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                    {submitting ? "Submitting…" : "Submit for review"}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </main>
    </section>
  );
}
