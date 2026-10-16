"use client";
import BookEditGuard from "@/app/components/dashbaord/BookEditGuard";

import AuthorSidebar from "@/app/components/dashbaord/AuthorSidebar";
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

function Metadata() {
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

  const readiness = [
    ['Book description', Boolean(description.trim())],
    ['Author biography', Boolean(authorBiography.trim())],
    ['Categories', categories.length > 0],
    ['Search keywords', keywords.length > 0 && !hasTooManyKeywords],
    ['Publishing declaration', termsAccepted],
  ];
  return <div className="ui-workspace">
    <AuthorSidebar currentStep="metadata" />
    <main className="ui-shell">
      <header className="ui-heading"><div><p className="ui-eyebrow">03 / Prepare for readers</p><h1>Publication details</h1><p>A clear description, a little about you, and the details that help readers find your book.</p></div><Link href={`/write/tool/step2/${bookId}/canva/preview`} className="ui-button ui-button-secondary"><Eye size={15}/>Preview book</Link></header>
      {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-lg border p-3 text-sm ${notice.type==='error'?'border-red-200 bg-red-50 text-red-800':'border-green-200 bg-green-50 text-green-800'}`}>{notice.text}</div>}
      {loading ? <div className="ui-card flex items-center gap-3 text-slate-500"><Loader2 size={16} className="animate-spin"/>Loading publication details…</div> : <form onSubmit={handleSubmit}>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <fieldset disabled={isLocked || saving || submitting} className="min-w-0 space-y-4 disabled:opacity-70">
            <div className="ui-form-columns">
              <section className="ui-card"><label htmlFor="book-description" className="ui-section-title">Book description</label><p className="ui-help mb-4">Give readers a reason to turn the first page.</p><textarea id="book-description" value={description} onChange={e=>setDescription(e.target.value)} rows={6} maxLength={DESCRIPTION_LIMIT} placeholder="Introduce your story, topic or promise…" className="ui-field resize-y"/><p className="mt-2 text-right text-[11px] text-slate-400">{description.length} / {DESCRIPTION_LIMIT}</p></section>
              <section className="ui-card"><label htmlFor="author-biography" className="ui-section-title">About the author</label><p className="ui-help mb-4">Share the person and perspective behind the book.</p><textarea id="author-biography" value={authorBiography} onChange={e=>setAuthorBiography(e.target.value)} rows={6} maxLength={BIOGRAPHY_LIMIT} placeholder="A short introduction to you and your work…" className="ui-field resize-y"/><p className="mt-2 text-right text-[11px] text-slate-400">{authorBiography.length} / {BIOGRAPHY_LIMIT}</p></section>
            </div>
            <section className="ui-card"><div className="flex items-center justify-between gap-4"><h2>Help readers discover your book</h2><span className="text-[11px] text-slate-400">{categories.length} / {MAX_CATEGORIES} categories</span></div><p className="ui-help">Choose up to three categories that fit your work.</p><div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Book categories">{CATEGORY_OPTIONS.map(category=><button key={category} type="button" className="ui-choice" aria-pressed={categories.includes(category)} disabled={!categories.includes(category)&&categories.length>=MAX_CATEGORIES} onClick={()=>toggleCategory(category)}>{categories.includes(category)&&<Check size={13}/>} {category}</button>)}</div>
              <div className="mt-5 border-t border-slate-100 pt-4"><div className="flex items-center justify-between"><label htmlFor="keywords" className="ui-label">Search keywords</label><span className={`text-[11px] ${hasTooManyKeywords?'text-red-700':'text-slate-400'}`}>{keywords.length} / {MAX_KEYWORDS}</span></div><input id="keywords" value={keywordsInput} onChange={e=>setKeywordsInput(e.target.value)} className="ui-field" placeholder="e.g. Indian fiction, family stories, coming of age" aria-describedby="keyword-help" aria-invalid={hasTooManyKeywords}/><p id="keyword-help" className="ui-help">Separate phrases with commas. Use up to seven.</p></div>
            </section>
            <section className="ui-card"><h2>Ready for editorial review?</h2><ul className="ui-checklist"><li><CheckCircle2/>I own the rights needed to publish this work; it does not unlawfully copy another work.</li><li><CheckCircle2/>The book does not contain unlawful, defamatory or intentionally misleading material.</li><li><CheckCircle2/>This saved version will be locked until the review team makes a decision.</li></ul><label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-[#d1e0d9] bg-[#f0f5f2] p-3"><input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#315e54]"/><span className="text-xs font-medium leading-5 text-[#315e54]">I confirm these statements and agree to submit this version for review.</span></label>
              <details className="mt-4 border-t border-slate-100 pt-4"><summary className="cursor-pointer text-xs font-semibold text-slate-600">Add a note for the reviewer <span className="font-normal text-slate-400">· optional</span></summary><label htmlFor="author-message" className="sr-only">Note for the reviewer</label><textarea id="author-message" value={authorMessage} onChange={e=>setAuthorMessage(e.target.value)} rows={3} maxLength={1000} placeholder="Anything the reviewer should know about this edition?" className="ui-field mt-3"/></details>
            </section>
          </fieldset>
          <aside className="space-y-4 lg:sticky lg:top-6"><section className="ui-card"><p className="ui-eyebrow">Submission checklist</p><h2 className="mt-3 break-words">{book?.title || 'Your book'}</h2><p className="ui-help">{readiness.filter(([,ready])=>ready).length} of {readiness.length} details complete</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#527e70] transition-all" style={{width:`${readiness.filter(([,ready])=>ready).length/readiness.length*100}%`}}/></div><ul className="ui-checklist">{readiness.map(([label,ready])=><li key={label}><CheckCircle2 className={ready?'opacity-100':'opacity-25'}/><span className={ready?'text-slate-700':'text-slate-400'}>{label}</span></li>)}</ul></section><section className="rounded-xl bg-[#19334c] p-5 text-white"><h2 className="text-sm font-semibold">Review first. Publish next.</h2><p className="mt-3 text-xs leading-6 text-slate-300">After submitting, pay the one-time ₹199 review fee to enter the review queue. If you have already paid for this book, revisions carry no extra review fee.</p></section></aside>
        </div>
        <div className="ui-actions"><Link href={`/write/tool/step2/${bookId}`} className="inline-flex items-center gap-2 text-xs font-medium text-slate-500"><ArrowLeft size={14}/>Back to book studio</Link><div className="flex flex-wrap gap-2"><button type="button" onClick={handleSave} disabled={isLocked||saving||submitting} className="ui-button ui-button-secondary"><Save size={14}/>{saving?'Saving…':'Save draft'}</button><button type="submit" disabled={isLocked||saving||submitting} className="ui-button"><Send size={14}/>{submitting?'Submitting…':'Submit for review'}</button></div></div>
      </form>}
    </main>
  </div>;
}

export default function ProtectedBookPage() {
 const p = useParams(); const raw = p?.bookId ?? p?.id; const id = Array.isArray(raw) ? raw[0] : raw;
 return <BookEditGuard bookId={id}><Metadata /></BookEditGuard>;
}
