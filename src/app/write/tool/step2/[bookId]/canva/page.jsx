"use client";
import BookEditGuard from "@/app/components/dashbaord/BookEditGuard";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Disclosure } from "@headlessui/react";
import { ArrowLeft, BookOpen, ChevronDown, Menu, Plus, Trash2, X } from "lucide-react";
import Toolbar from "@/app/components/editor/Toolbar";
import EditorArea from "@/app/components/editor/EditorArea";
import BookStylePicker from "@/app/components/editor/BookStylePicker";
import { getBookStyle, getTrimSize } from "@/utils/bookLayout";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const FRONT_MATTER_TITLES = ["Dedication", "Foreword"];
const BACK_MATTER_TITLE = "Back Matter";
const isFrontMatter = (chapter) => ["intro", "preface"].includes(chapter?.type);
const isBackMatter = (title = "") => title.trim().toLowerCase() === BACK_MATTER_TITLE.toLowerCase();
const chapterNumber = (title = "") => {
  const match = String(title).match(/^\s*chapter\s+(\d+)\b/i);
  return match ? Number.parseInt(match[1], 10) : null;
};
const draftKey = (bookId, chapterId) => `nobel-editor-draft:${bookId}:${chapterId}`;

function readDraft(bookId, chapterId) {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(draftKey(bookId, chapterId));
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function storeDraft(bookId, chapterId, draft) {
  try {
    window.localStorage.setItem(
      draftKey(bookId, chapterId),
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })
    );
  } catch {
    // Navigation protection remains active if browser storage is unavailable.
  }
}

function clearDraft(bookId, chapterId) {
  try {
    window.localStorage.removeItem(draftKey(bookId, chapterId));
  } catch {
    // A successful server save is enough when browser storage is unavailable.
  }
}

function EditorPage({ bookId }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const accessToken = session?.user?.accessToken;
  const editorRef = useRef(null);

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState({ id: null, title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [saveState, setSaveState] = useState("saved");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [styleSaving, setStyleSaving] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }),
    [accessToken]
  );

  const orderChapters = useCallback((items) => {
    const front = items.filter(isFrontMatter);
    const chaptersOnly = items.filter((item) => !isFrontMatter(item) && !isBackMatter(item.title));
    const back = items.filter((item) => isBackMatter(item.title));
    front.sort((a, b) => {
      const index = (chapter) => {
        const found = FRONT_MATTER_TITLES.findIndex(
          (name) => name.toLowerCase() === (chapter.title || "").toLowerCase()
        );
        return found < 0 ? 99 : found;
      };
      return index(a) - index(b);
    });
    chaptersOnly.sort((a, b) => (a.position || 0) - (b.position || 0) || a.id - b.id);
    return [...front, ...chaptersOnly, ...back];
  }, []);

  const selectChapter = useCallback(
    (chapter, restoreDraft = true) => {
      if (!chapter) {
        setCurrentId(null);
        setTitle("");
        setContent("");
        setSavedSnapshot({ id: null, title: "", content: "" });
        return;
      }
      const serverTitle = chapter.title || "";
      const serverContent = chapter.content || "<p></p>";
      const localDraft = restoreDraft ? readDraft(bookId, chapter.id) : null;
      setCurrentId(chapter.id);
      setTitle(localDraft?.title ?? serverTitle);
      setContent(localDraft?.content ?? serverContent);
      setSavedSnapshot({ id: chapter.id, title: serverTitle, content: serverContent });
      setSaveState(localDraft ? "unsaved" : "saved");
      setMobileNavigationOpen(false);
      if (localDraft) setMessage("Recovered an unsaved draft from this device.");
    },
    [bookId]
  );

  const ensureFrontMatter = useCallback(
    async (existing) => {
      const items = [...existing];
      const required = [
        { title: "Dedication", type: "intro", content: "<p>Write your dedication here…</p>" },
        { title: "Foreword", type: "preface", content: "<p>Write the foreword here…</p>" },
      ];
      for (const section of required) {
        if (items.some((item) => (item.title || "").toLowerCase() === section.title.toLowerCase())) continue;
        const response = await fetch(`${API_BASE}/chapters/${bookId}`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(section),
        });
        const created = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(created?.message || `Could not create ${section.title}.`);
        items.push(created);
      }
      return items;
    },
    [authHeaders, bookId]
  );

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !accessToken) {
      setLoading(false);
      return;
    }
    if (!API_BASE || !bookId) {
      setMessage("The publishing service is not configured.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    async function loadManuscript() {
      setLoading(true);
      try {
        const [chapterResponse, bookResponse] = await Promise.all([
          fetch(`${API_BASE}/chapters/${bookId}`, {
            headers: authHeaders(),
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/books/${bookId}`, {
            headers: authHeaders(),
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);
        if (!chapterResponse.ok) throw new Error("Could not load the manuscript.");
        if (!bookResponse.ok) throw new Error("Could not load the book details.");
        const [chapterData, bookData] = await Promise.all([chapterResponse.json(), bookResponse.json()]);
        setBook(bookData?.book || bookData);
        const completeList = await ensureFrontMatter(Array.isArray(chapterData) ? chapterData : []);
        const ordered = orderChapters(completeList);
        setChapters(ordered);
        selectChapter(
          ordered.find((item) => !isFrontMatter(item) && !isBackMatter(item.title)) || ordered[0]
        );
      } catch (error) {
        if (error?.name !== "AbortError") setMessage(error?.message || "Could not load the manuscript.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadManuscript();
    return () => controller.abort();
  }, [accessToken, authHeaders, bookId, ensureFrontMatter, orderChapters, selectChapter, status]);

  const isDirty = Boolean(
    currentId &&
      savedSnapshot.id === currentId &&
      (title !== savedSnapshot.title || content !== savedSnapshot.content)
  );

  const saveChapter = useCallback(
    async (chapterId, nextTitle, nextContent, { quiet = false } = {}) => {
      if (!chapterId || !accessToken) return false;
      setSaving(true);
      setSaveState("saving");
      if (!quiet) setMessage("");
      try {
        const savedTitle = nextTitle.trim() || "Untitled section";
        const response = await fetch(`${API_BASE}/chapters/${chapterId}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ title: savedTitle, content: nextContent }),
        });
        const updated = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(updated?.message || "Could not save this section.");
        setChapters((items) =>
          items.map((item) =>
            item.id === chapterId ? { ...item, ...updated, title: savedTitle, content: nextContent } : item
          )
        );
        if (chapterId === currentId) {
          if (!nextTitle.trim()) setTitle(savedTitle);
          setSavedSnapshot({ id: chapterId, title: savedTitle, content: nextContent });
        }
        clearDraft(bookId, chapterId);
        setSaveState("saved");
        if (!quiet) setMessage("Changes saved.");
        return true;
      } catch (error) {
        setSaveState("error");
        setMessage(`${error?.message || "Save failed."} Your draft is safe on this device.`);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [accessToken, authHeaders, bookId, currentId]
  );

  useEffect(() => {
    if (!isDirty || !currentId) return;
    setSaveState("unsaved");
    storeDraft(bookId, currentId, { title, content });
    const timer = window.setTimeout(() => {
      if (!saving) saveChapter(currentId, title, content, { quiet: true });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [bookId, content, currentId, isDirty, saveChapter, saving, title]);

  useEffect(() => {
    const beforeUnload = (event) => {
      if (!isDirty && !saving) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty, saving]);

  async function loadChapter(id) {
    if (id === currentId) return setMobileNavigationOpen(false);
    if (isDirty && !(await saveChapter(currentId, title, content, { quiet: true }))) return;
    const nextChapter = chapters.find((item) => item.id === id);
    if (nextChapter) selectChapter(nextChapter);
  }

  async function createSection(section) {
    if (isDirty && !(await saveChapter(currentId, title, content, { quiet: true }))) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/chapters/${bookId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(section),
      });
      const created = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(created?.message || "Could not create this section.");
      const refreshed = await fetch(`${API_BASE}/chapters/${bookId}`, { headers: authHeaders(), cache: "no-store" });
      if (!refreshed.ok) throw new Error("Section created, but the contents list could not refresh. Reload to continue.");
      setChapters(orderChapters(await refreshed.json()));
      selectChapter(created, false);
      setMessage(`${created.title || "Section"} created.`);
    } catch (error) {
      setMessage(error?.message || "Could not create this section.");
    } finally {
      setSaving(false);
    }
  }

  function createChapter() {
    const used = new Set(
      chapters
        .filter((item) => !isFrontMatter(item) && !isBackMatter(item.title))
        .map((item) => chapterNumber(item.title))
        .filter(Boolean)
    );
    let number = 1;
    while (used.has(number)) number += 1;
    return createSection({ title: `Chapter ${number}`, type: "chapter", content: "", ...(bodyChapters.some(c => c.id === currentId) ? { afterChapterId: currentId } : {}) });
  }

  async function changeBookStyle(layoutStyle) {
    setStyleSaving(true);
    try {
      const design = { size: 'FIVE_X_EIGHT', bindingType: 'PAPERBACK', interior: 'BLACK_WHITE', paperType: 'CREAM', coverLamination: 'MATTE', ...book?.design, layoutStyle };
      const response = await fetch(`${API_BASE}/books/${bookId}/design`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(design) });
      const saved = await response.json();
      if (!response.ok) throw new Error(saved.message || 'Could not save the book style.');
      setBook(current => ({ ...current, design: saved }));
      setMessage('Book style saved. It applies to every section.');
      return true;
    } catch (error) { setMessage(error.message); return false; }
    finally { setStyleSaving(false); }
  }

  async function deleteChapter(id) {
    const victim = chapters.find((item) => item.id === id);
    if (!victim || isFrontMatter(victim)) return;
    if (!window.confirm(`Delete “${victim.title}”? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE}/chapters/${id}`, { method: "DELETE", headers: authHeaders() });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Could not delete this section.");
      clearDraft(bookId, id);
      const remaining = chapters.filter((item) => item.id !== id);
      setChapters(remaining);
      if (currentId === id) selectChapter(remaining[0] || null);
      setMessage("Section deleted.");
    } catch (error) {
      setMessage(error?.message || "Could not delete this section.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatText(command, value) {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setContent(editorRef.current.innerHTML);
  }

  function clearEditor() {
    if (content.replace(/<[^>]*>/g, "").trim() && !window.confirm("Clear all text in this section?")) return;
    setContent("");
    if (editorRef.current) editorRef.current.innerHTML = "";
  }

  async function openPreview() {
    if (isDirty && !(await saveChapter(currentId, title, content))) return;
    router.push(`/write/tool/step2/${bookId}/canva/preview`);
  }

  const frontMatter = useMemo(() => chapters.filter(isFrontMatter), [chapters]);
  const bodyChapters = useMemo(
    () => chapters.filter((item) => !isFrontMatter(item) && !isBackMatter(item.title)),
    [chapters]
  );
  const backMatter = useMemo(() => chapters.filter((item) => isBackMatter(item.title)), [chapters]);

  if (status === "loading" || loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 text-slate-600">
        <div className="flex items-center gap-3" role="status">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading your manuscript…
        </div>
      </main>
    );
  }

  if (status !== "authenticated" || !accessToken) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-blue-600" />
          <h1 className="text-xl font-semibold text-slate-900">Sign in to continue writing</h1>
          <p className="mt-2 text-sm text-slate-600">Your manuscript is private and can only be opened from your author account.</p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/write/tool/step2/${bookId}/canva`)}`}
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  const selectedSection = chapters.find(c => c.id === currentId);
  const chapterIndex = bodyChapters.slice(0, bodyChapters.findIndex(c => c.id === currentId) + 1).filter(c => c.type === 'chapter').length;
  const bookStyle = getBookStyle(book?.design?.layoutStyle, book?.language);
  const trim = getTrimSize(book?.design?.size, book?.design);
  const bookTitle = book?.title || "Untitled book";
  const author = [book?.authorName, book?.coAuthor].filter(Boolean).join(" & ") || "Author";
  const saveLabel = {
    saved: "All changes saved",
    saving: "Saving…",
    unsaved: "Unsaved changes",
    error: "Save failed — draft kept",
  }[saveState];

  const chapterItem = (chapter, canDelete = false) => (
    <li key={chapter.id}>
      <div className={`group flex items-center rounded-lg ${chapter.id === currentId ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-slate-700 hover:text-white"}`}>
        <button
          type="button"
          onClick={() => loadChapter(chapter.id)}
          className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-current={chapter.id === currentId ? "page" : undefined}
        >
          {chapter.type === "section" ? "↳ " : ""}{chapter.title || "Untitled section"}
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={() => deleteChapter(chapter.id)}
            disabled={Boolean(deletingId)}
            className="mr-1 rounded p-2 text-slate-300 opacity-70 hover:bg-red-500/20 hover:text-red-200 group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
            aria-label={`Delete ${chapter.title}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </li>
  );

  return (
    <div className="min-h-screen w-full bg-slate-100 lg:flex">
      {mobileNavigationOpen && (
        <button type="button" className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" aria-label="Close manuscript navigation" onClick={() => setMobileNavigationOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#142b40] text-white shadow-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${!sidebarOpen ? "lg:hidden" : ""} ${mobileNavigationOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Manuscript sections"
      >
        <div className="border-b border-white/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <Link href="/author-dashboard" className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Author dashboard
            </Link>
            <button type="button" className="rounded p-1 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setMobileNavigationOpen(false)} aria-label="Close manuscript navigation">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <h1 className="mt-4 line-clamp-2 text-lg font-semibold">{bookTitle}</h1>
          <p className="mt-1 truncate text-xs text-slate-400">by {author}</p>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-4">
          <Disclosure defaultOpen>
            {({ open }) => (
              <section>
                <Disclosure.Button className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold hover:bg-white/5">
                  Front matter
                  <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                </Disclosure.Button>
                <Disclosure.Panel><ul className="mt-1 space-y-1">{frontMatter.map((item) => chapterItem(item))}</ul></Disclosure.Panel>
              </section>
            )}
          </Disclosure>
          <section>
            <div className="flex items-center justify-between px-2 py-2">
              <h2 className="text-sm font-semibold">Chapters</h2>
              <button type="button" onClick={createChapter} disabled={saving} className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40" aria-label="Add chapter">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <button type="button" disabled={saving || !bodyChapters.some(c => c.id === currentId)} onClick={() => createSection({ title: "New section", type: "section", content: "", afterChapterId: currentId })} className="mb-2 w-full rounded-md border border-white/15 px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/10 disabled:opacity-30">＋ Add section after current</button>
            {bodyChapters.length ? <ul className="space-y-1">{bodyChapters.map((item) => chapterItem(item, true))}</ul> : <p className="px-2 text-xs leading-5 text-slate-400">Add a chapter to begin your manuscript.</p>}
          </section>
          <Disclosure defaultOpen>
            {({ open }) => (
              <section>
                <div className="flex items-center">
                  <Disclosure.Button className="flex min-w-0 flex-1 items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold hover:bg-white/5">
                    Back matter
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                  </Disclosure.Button>
                  {!backMatter.length && (
                    <button type="button" onClick={() => createSection({ title: BACK_MATTER_TITLE, type: "chapter", content: "<p>Add acknowledgements, resources, or author notes here…</p>" })} disabled={saving} className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40" aria-label="Add back matter">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <Disclosure.Panel>
                  {backMatter.length ? <ul className="mt-1 space-y-1">{backMatter.map((item) => chapterItem(item, true))}</ul> : <p className="px-2 text-xs leading-5 text-slate-400">Optional acknowledgements, resources, or author notes.</p>}
                </Disclosure.Panel>
              </section>
            )}
          </Disclosure>
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden" onClick={() => setMobileNavigationOpen(true)} aria-label="Open manuscript navigation">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" className="hidden rounded-lg border border-slate-200 p-2 lg:block" onClick={() => setSidebarOpen(v => !v)} aria-label={sidebarOpen ? "Hide manuscript navigation" : "Show manuscript navigation"}><Menu size={18} /></button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{title || "Untitled section"}</p>
              <p className={`text-xs ${saveState === "error" ? "text-red-600" : "text-slate-500"}`} role="status" aria-live="polite">{saveLabel}</p>
            </div>
            <BookStylePicker language={book?.language} value={bookStyle} onChange={changeBookStyle} disabled={styleSaving} />
            <button type="button" onClick={() => saveChapter(currentId, title, content)} disabled={saving || !currentId || !isDirty} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Save</button>
            <button type="button" onClick={openPreview} disabled={saving || styleSaving} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 sm:px-4">
              <span className="hidden sm:inline">Review book</span><span className="sm:hidden">Review</span>
            </button>
          </div>
          {message && (
            <p className={`mt-2 rounded-md px-3 py-2 text-sm ${saveState === "error" || /could not|failed/i.test(message) ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`} role="alert">{message}</p>
          )}
        </header>

        <div className="w-full">
          {currentId ? (
            <section className="bg-white">
              <Toolbar onFormat={formatText} onReset={clearEditor} />
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2">
                <label htmlFor="chapter-title" className="shrink-0 text-xs text-slate-500">Section title</label>
                <input id="chapter-title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Section title" className="w-full rounded border border-slate-200 bg-transparent px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300" />
              </div>
              <EditorArea key={currentId} editorRef={editorRef} content={content} setContent={setContent} section={{ title, type: selectedSection?.type, number: chapterIndex }} bookStyle={bookStyle} trim={trim} ariaLabel={`Content for ${title || "this section"}`} />
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">Your manuscript has no editable section</h2>
              <button type="button" onClick={createChapter} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Add first chapter</button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProtectedBookPage() {
 const p = useParams(); const raw = p?.bookId ?? p?.id; const id = Array.isArray(raw) ? raw[0] : raw;
 return <BookEditGuard bookId={id}><EditorPage bookId={id} /></BookEditGuard>;
}
