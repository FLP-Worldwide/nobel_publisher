"use client";
import FinalBookPreviewDialog from "@/app/components/editor/FinalBookPreviewDialog";
import { normalizeBook } from "@/utils/bookPreview";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { readPublicationResponse as readJson, submitReview, publicationErrorNotice } from "@/utils/reviewSubmission.mjs";

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

function Metadata() {
  const router = useRouter();
  const params = useParams();
  const bookId = Array.isArray(params?.bookId) ? params.bookId[0] : params?.bookId;
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user?.accessToken;

  const [book, setBook] = useState(null);
  const [reviewFee, setReviewFee] = useState(null);
  const [description, setDescription] = useState("");
  const [authorBiography, setAuthorBiography] = useState("");
  const [categories, setCategories] = useState([]);
  const [copyrightHolder, setCopyrightHolder] = useState("");
  const [copyrightYear, setCopyrightYear] = useState(String(new Date().getFullYear()));
  const [copyrightNotice, setCopyrightNotice] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [authorMessage, setAuthorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [finalProof, setFinalProof] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const submittingRef = useRef(false);
  const recoveryRef = useRef(false);

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
      setReviewFee(data.reviewFee || null);
      setDescription(data?.description || "");
      setCopyrightHolder(data?.copyrightHolder || [data?.authorName, data?.coAuthor].filter(Boolean).join(" & "));
      setCopyrightYear(String(data?.copyrightYear || new Date().getFullYear()));
      setCopyrightNotice(data?.copyrightNotice || "");
      setAuthorBiography(data?.authorBiography || "");
      setCategories(Array.isArray(data?.categories) ? data.categories : []);
      setKeywordsInput(
        Array.isArray(data?.keywords) ? data.keywords.join(", ") : data?.keywords || ""
      );
      setTermsAccepted(Boolean(data?.termsAccepted ?? data?.termsAcceptedAt));
    } catch (error) {
      setNotice({ type: "error", title: "Publication details couldn’t be opened", text: "Check your connection and reopen this book from your dashboard." });
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
    if (!/^\d{4}$/.test(copyrightYear) || Number(copyrightYear) < 1450 || Number(copyrightYear) > new Date().getFullYear() + 2) return "Enter a valid copyright year.";
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
        copyrightHolder: copyrightHolder.trim(), copyrightYear: Number(copyrightYear), copyrightNotice: copyrightNotice.trim(),
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
    if (submittingRef.current || saving) return;
    const validationError = validateForSave();
    if (validationError) {
      setNotice({ type: "error", title: "Check your book details", text: validationError });
      return;
    }
    setNotice(null);
    setSaving(true);
    try {
      await saveMetadata();
    } catch (error) {
      setNotice({ ...publicationErrorNotice(error), action: "save" });
    } finally {
      setSaving(false);
    }
  }

  async function openFinalPreview() {
    if (previewLoading || saving || submitting) return;
    const validationError = validateForSave();
    if (validationError) { setNotice({ type: "error", title: "Check your book details", text: validationError }); return; }
    setPreviewLoading(true); setNotice(null);
    try {
      const savedBook = await saveMetadata({ showSuccess: false });
      setFinalProof(normalizeBook(savedBook, savedBook.design, session?.user?.name));
    } catch (error) { setNotice({ ...publicationErrorNotice(error), action: "save" }); }
    finally { setPreviewLoading(false); }
  }

  async function handleSubmit(event) {
    event?.preventDefault();
    if (submittingRef.current || saving) return;
    setNotice(null);

    const validationError = validateForSubmission();
    if (validationError) {
      setNotice({ type: "error", title: "One more detail before you submit", text: validationError });
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await submitReview({
        apiBase: API_BASE, bookId, headers: authHeaders, message: authorMessage,
        recoverFirst: recoveryRef.current,
        saveDraft: () => saveMetadata({ showSuccess: false }),
      });
      recoveryRef.current = false;
      router.push(`/write/tool/step2/${bookId}/pricing_info`);
    } catch (error) {
      recoveryRef.current = error.phase !== "save";
      setNotice(publicationErrorNotice(error));
    } finally {
      submittingRef.current = false;
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
      <header className="ui-heading"><div><p className="ui-eyebrow">03 / Prepare for readers</p><h1>Publication details</h1><p>A clear description, a little about you, and the details that help readers find your book.</p></div><button type="button" onClick={openFinalPreview} disabled={loading||saving||submitting||previewLoading} className="ui-button ui-button-secondary"><Eye size={15}/>{previewLoading?"Preparing preview…":"Final book preview"}</button></header>
      {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-xl border p-4 text-sm ${notice.type==='error'?'border-amber-200 bg-amber-50 text-amber-950':'border-green-200 bg-green-50 text-green-800'}`}>
        {notice.title && <p className="font-semibold">{notice.title}</p>}
        <p className={notice.title ? "mt-1 leading-6" : ""}>{notice.text}</p>
        {notice.issues?.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5">{notice.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
        {notice.retry && <button type="button" disabled={saving || submitting} onClick={() => notice.action === "save" ? handleSave() : handleSubmit()} className="ui-button mt-3">{submitting ? 'Checking submission…' : 'Try again'}</button>}
        {notice.statusLink && <Link href={`/write/tool/step2/${bookId}/pricing_info`} className="ui-button ui-button-secondary mt-3">Check review status</Link>}
      </div>}

      {loading ? <div className="ui-card flex items-center gap-3 text-slate-500"><Loader2 size={16} className="animate-spin"/>Loading publication details…</div> : <form onSubmit={handleSubmit}>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <fieldset disabled={isLocked || saving || submitting || previewLoading} className="min-w-0 space-y-4 disabled:opacity-70">
            <div className="ui-form-columns">
              <section className="ui-card"><label htmlFor="book-description" className="ui-section-title">Book description</label><p className="ui-help mb-4">Give readers a reason to turn the first page.</p><textarea id="book-description" value={description} onChange={e=>setDescription(e.target.value)} rows={6} maxLength={DESCRIPTION_LIMIT} placeholder="Introduce your story, topic or promise…" className="ui-field resize-y"/><p className="mt-2 text-right text-[11px] text-slate-400">{description.length} / {DESCRIPTION_LIMIT}</p></section>
              <section className="ui-card"><label htmlFor="author-biography" className="ui-section-title">About the author</label><p className="ui-help mb-4">Share the person and perspective behind the book.</p><textarea id="author-biography" value={authorBiography} onChange={e=>setAuthorBiography(e.target.value)} rows={6} maxLength={BIOGRAPHY_LIMIT} placeholder="A short introduction to you and your work…" className="ui-field resize-y"/><p className="mt-2 text-right text-[11px] text-slate-400">{authorBiography.length} / {BIOGRAPHY_LIMIT}</p></section>
            </div>
            <section className="ui-card"><div className="flex items-center justify-between gap-4"><h2>Help readers discover your book</h2><span className="text-[11px] text-slate-400">{categories.length} / {MAX_CATEGORIES} categories</span></div><p className="ui-help">Choose up to three categories that fit your work.</p><div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Book categories">{CATEGORY_OPTIONS.map(category=><button key={category} type="button" className="ui-choice" aria-pressed={categories.includes(category)} disabled={!categories.includes(category)&&categories.length>=MAX_CATEGORIES} onClick={()=>toggleCategory(category)}>{categories.includes(category)&&<Check size={13}/>} {category}</button>)}</div>
              <div className="mt-5 border-t border-slate-100 pt-4"><div className="flex items-center justify-between"><label htmlFor="keywords" className="ui-label">Search keywords</label><span className={`text-[11px] ${hasTooManyKeywords?'text-red-700':'text-slate-400'}`}>{keywords.length} / {MAX_KEYWORDS}</span></div><input id="keywords" value={keywordsInput} onChange={e=>setKeywordsInput(e.target.value)} className="ui-field" placeholder="e.g. Indian fiction, family stories, coming of age" aria-describedby="keyword-help" aria-invalid={hasTooManyKeywords}/><p id="keyword-help" className="ui-help">Separate phrases with commas. Use up to seven.</p></div>
            </section>
            <section className="ui-card"><h2>Copyright page</h2><p className="ui-help">Name the copyright holder and year. We add a rights notice and identify Nobel Books as the self-publishing platform.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_130px]"><label className="ui-label">Copyright holder<input value={copyrightHolder} onChange={e=>setCopyrightHolder(e.target.value)} maxLength={160} className="ui-field mt-2" placeholder="Author or rights holder"/></label><label className="ui-label">Copyright year<input type="number" value={copyrightYear} onChange={e=>setCopyrightYear(e.target.value)} min={1450} max={new Date().getFullYear()+2} className="ui-field mt-2"/></label></div>
              <label className="ui-label mt-4 block">Additional credits or permissions <span className="font-normal text-slate-400">· optional</span><textarea value={copyrightNotice} onChange={e=>setCopyrightNotice(e.target.value)} rows={3} maxLength={3000} className="ui-field mt-2" placeholder="Cover credits, edition information or permissions acknowledgments"/></label>
              {book?.chapters?.some(chapter=>/^(copyright|कॉपीराइट|सर्वाधिकार)$/i.test(chapter.title?.trim()||'')) && <p className="ui-help mt-3">Your manuscript has its own copyright section. Its text will be used in the proof; edit that section in the writing desk to change it.</p>}
            </section>
            <section className="ui-card"><h2>Ready for editorial review?</h2><ul className="ui-checklist"><li><CheckCircle2/>I own the rights needed to publish this work; it does not unlawfully copy another work.</li><li><CheckCircle2/>The book does not contain unlawful, defamatory or intentionally misleading material.</li><li><CheckCircle2/>This saved version will be locked until the review team makes a decision.</li></ul><label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-[#d1e0d9] bg-[#f0f5f2] p-3"><input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#315e54]"/><span className="text-xs font-medium leading-5 text-[#315e54]">I confirm these statements and agree to submit this version for review.</span></label>
              <details className="mt-4 border-t border-slate-100 pt-4"><summary className="cursor-pointer text-xs font-semibold text-slate-600">Add a note for the reviewer <span className="font-normal text-slate-400">· optional</span></summary><label htmlFor="author-message" className="sr-only">Note for the reviewer</label><textarea id="author-message" value={authorMessage} onChange={e=>setAuthorMessage(e.target.value)} rows={3} maxLength={1000} placeholder="Anything the reviewer should know about this edition?" className="ui-field mt-3"/></details>
            </section>
          </fieldset>
          <aside className="space-y-4 lg:sticky lg:top-6"><section className="ui-card"><p className="ui-eyebrow">Submission checklist</p><h2 className="mt-3 break-words">{book?.title || 'Your book'}</h2><p className="ui-help">{readiness.filter(([,ready])=>ready).length} of {readiness.length} details complete</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#527e70] transition-all" style={{width:`${readiness.filter(([,ready])=>ready).length/readiness.length*100}%`}}/></div><ul className="ui-checklist">{readiness.map(([label,ready])=><li key={label}><CheckCircle2 className={ready?'opacity-100':'opacity-25'}/><span className={ready?'text-slate-700':'text-slate-400'}>{label}</span></li>)}</ul></section><section className="rounded-xl bg-[#19334c] p-5 text-white"><h2 className="text-sm font-semibold">Review first. Publish next.</h2><p className="mt-3 text-xs leading-6 text-slate-300">{reviewFee?.mode === "demo" || reviewFee?.waived ? "Demo mode: submit directly to editorial review. The review fee is waived and no payment is collected. Editorial approval is still required." : "After submitting, pay the one-time ₹199 review fee to enter the review queue. If you have already paid for this book, revisions carry no extra review fee."}</p></section></aside>
        </div>
        <section id="final-book-preview" className="ui-card mt-5 scroll-mt-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="ui-eyebrow">One final look</p><h2 className="mt-2">Your complete book, cover to cover</h2><p className="ui-help">Check the saved front cover, copyright page, contents, every chapter and back cover before you submit.</p></div><button type="button" disabled={saving||submitting||previewLoading} onClick={openFinalPreview} className="ui-button ui-button-secondary"><Eye size={15}/>{previewLoading?'Preparing preview…':finalProof?'Save and refresh preview':'Open final book preview'}</button></div>
          <p className="mt-3 text-xs leading-6 text-slate-500">Your details are saved before the preview opens. Close it to return here and submit.</p>
        </section>
        <div className="ui-actions"><Link href={`/write/tool/step2/${bookId}`} className="inline-flex items-center gap-2 text-xs font-medium text-slate-500"><ArrowLeft size={14}/>Back to book studio</Link><div className="flex flex-wrap gap-2"><button type="button" onClick={handleSave} disabled={isLocked||saving||submitting||previewLoading} className="ui-button ui-button-secondary"><Save size={14}/>{saving?'Saving…':'Save draft'}</button><button type="submit" disabled={isLocked||saving||submitting||previewLoading} className="ui-button"><Send size={14}/>{submitting?'Submitting…':'Submit for review'}</button></div></div>
      </form>}
    </main>
    <FinalBookPreviewDialog book={finalProof} accessToken={accessToken} onClose={() => setFinalProof(null)}/>
  </div>;
}

export default function ProtectedBookPage() {
 const p = useParams(); const raw = p?.bookId ?? p?.id; const id = Array.isArray(raw) ? raw[0] : raw;
 return <BookEditGuard bookId={id}><Metadata /></BookEditGuard>;
}
