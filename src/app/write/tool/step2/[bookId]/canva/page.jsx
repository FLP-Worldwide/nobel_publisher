"use client";

import { useEffect, useRef, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/editor/Toolbar";
import EditorArea from "@/app/components/editor/EditorArea";
import PreviewModal from "@/app/components/editor/PreviewModal";
import { Disclosure } from "@headlessui/react";
import { ArrowLeft, ChevronDown, Eye, PlusCircle, Trash } from "lucide-react";

export default function EditorPage({ params }) {
  const { bookId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const accessToken = session?.user?.accessToken;
  const API = process.env.NEXT_PUBLIC_API_URL;

  const editorRef = useRef(null);

  // Data
  const [chapters, setChapters] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  // UI state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [isTwoColumn, setIsTwoColumn] = useState(false);

  /* ---------------------------
     Constants / Helpers
  ----------------------------*/
  const BOOK_TITLE = "And She Left..."; // TODO: replace from DB if you have
  const AUTHOR_NAME = "Author";         // TODO: replace from DB if you have
  const FRONT_MATTER_TITLES = ["Dedication", "Foreword"];
  const BACK_MATTER_TITLE = "Back Matter"; // still title-based (no enum)

  // Use enum-based type for front matter
  const isFM = (ch) => ch?.type && ch.type !== "chapter"; // intro/preface => front matter
  const isBM = (t = "") =>
    (t || "").toLowerCase() === BACK_MATTER_TITLE.toLowerCase();

  const parseChapterNum = (t = "") => {
    const m = String(t).match(/^\s*chapter\s+(\d+)\b/i);
    return m ? parseInt(m[1], 10) : null;
  };

  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  });

  const selectChapterIntoEditor = (ch) => {
    if (!ch) {
      setCurrentId(null);
      setTitle("");
      setContent("");
      if (editorRef.current) editorRef.current.innerHTML = "";
      return;
    }
    setCurrentId(ch.id);
    setTitle(ch.title || "");
    const html = ch.content || "<p></p>";
    setContent(html);
    if (editorRef.current) editorRef.current.innerHTML = html;
  };

  /* ---------------------------
     Ensure Front Matter by TYPE
     Dedication -> intro
     Foreword   -> preface
  ----------------------------*/
  const ensureFrontMatter = async (existing = []) => {
    const list = [...existing];

    const want = [
      { title: "Dedication", type: "intro", content: "<p>Write your dedication here…</p>" },
      { title: "Foreword",   type: "preface", content: "<p>Write the foreword here…</p>" },
    ];

    for (const fm of want) {
      const already = list.find(
        (c) => (c.title || "").toLowerCase() === fm.title.toLowerCase()
      );
      if (!already) {
        const res = await fetch(`${API}/chapters/${bookId}`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            title: fm.title,
            type: fm.type, // <-- use enum types
            content: fm.content,
          }),
        });
        const created = await res.json();
        if (!res.ok) throw new Error(created?.message || `Failed to create ${fm.title}`);
        list.push(created);
      }
    }
    return list;
  };

  /* ---------------------------
     Back Matter create ON DEMAND
     (still title-based; no enum available)
  ----------------------------*/
  const handleCreateBackMatter = async () => {
    if (chapters.some((c) => isBM(c.title))) return;

    try {
      setSaving(true);
      setMsg("");
      const res = await fetch(`${API}/chapters/${bookId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: BACK_MATTER_TITLE,
          // No enum for back matter — keep as chapter or add enum later
          type: "chapter",
          content: "<p>Back matter content…</p>",
        }),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created?.message || "Failed to create Back Matter");

      const fm = chapters.filter((c) => isFM(c));
      const normal = chapters.filter((c) => !isFM(c) && !isBM(c.title));
      const next = [...fm, ...normal, created];
      setChapters(next);
      setMsg("✅ Back Matter created.");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------
     DELETE Chapter / Back Matter
     (block delete for front matter types)
  ----------------------------*/
  const handleDeleteChapter = async (id) => {
    const victim = chapters.find((c) => c.id === id);
    if (!victim) return;
    if (isFM(victim)) {
      setMsg("❌ Front Matter can't be deleted from here.");
      return;
    }
    const ok = window.confirm(`Delete "${victim.title}"? This cannot be undone.`);
    if (!ok) return;

    try {
      setDeletingId(id);
      setMsg("");

      const res = await fetch(`${API}/chapters/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to delete chapter");

      const next = chapters.filter((c) => c.id !== id);
      setChapters(next);

      if (currentId === id) {
        const nextChapter =
          next.find((c) => !isFM(c) && !isBM(c.title)) ||
          next.find((c) => isBM(c.title)) ||
          next.find((c) => isFM(c)) ||
          null;
        selectChapterIntoEditor(nextChapter);
      }

      setMsg("✅ Chapter deleted.");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------------------
     Load on mount
  ----------------------------*/
  useEffect(() => {
    if (!bookId) return;

    const load = async () => {
      try {
        const res = await fetch(`${API}/chapters/${bookId}`, {
          headers: authHeaders(),
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load chapters");
        const data = await res.json();

        const withFM = await ensureFrontMatter(data || []);

        // order: FM (by our FRONT_MATTER_TITLES) → chapters → BM
        const fm = withFM.filter((c) => isFM(c));
        const normal = withFM.filter((c) => !isFM(c) && !isBM(c.title));
        const bm = withFM.filter((c) => isBM(c.title));

        // Front matter order by title preference (Dedication -> Foreword)
        const fmOrder = (c) =>
          FRONT_MATTER_TITLES.findIndex(
            (t) => (c.title || "").toLowerCase() === t.toLowerCase()
          );
        fm.sort((a, b) => fmOrder(a) - fmOrder(b));

        // Chapters order by parsed "Chapter N"
        normal.sort((a, b) => {
          const na = parseChapterNum(a.title) ?? 9999;
          const nb = parseChapterNum(b.title) ?? 9999;
          return na - nb;
        });

        setChapters([...fm, ...normal, ...bm]);

        const firstNonFM = normal[0] || bm[0] || fm[0];
        if (firstNonFM) selectChapterIntoEditor(firstNonFM);
      } catch (e) {
        setMsg(e.message || "Failed to load chapters");
      } finally {
        setLoadingList(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, accessToken]);

  /* ---------------------------
     Formatting
  ----------------------------*/
  const formatText = (command, value) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      setContent(editorRef.current.innerHTML);
    }
  };

  const resetEditor = () => {
    if (editorRef.current) editorRef.current.innerHTML = "";
    setContent("");
  };

  /* ---------------------------
     Save current chapter
  ----------------------------*/
  const handleSave = async () => {
    if (!currentId) return;
    setSaving(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/chapters/${currentId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ title, content }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated?.message || "Failed to save");

      setChapters((prev) =>
        prev.map((c) => (c.id === currentId ? { ...c, title, content } : c))
      );
      setMsg("✅ Chapter saved.");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------
     Create new chapter
  ----------------------------*/
  const handleCreateChapter = async (selectAfterCreate = false) => {
    setSaving(true);
    setMsg("");

    try {
      const nonFMNonBM = chapters.filter((c) => !isFM(c) && !isBM(c.title));
      const usedNums = new Set(
        nonFMNonBM.map((c) => parseChapterNum(c.title)).filter(Boolean)
      );
      let nextN = 1;
      while (usedNums.has(nextN)) nextN++;

      const res = await fetch(`${API}/chapters/${bookId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: `Chapter ${nextN} - Untitled`,
          type: "chapter", // real chapter
          content: "<p>Start new chapter...</p>",
        }),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created?.message || "Failed to create chapter");

      const fm = chapters.filter((c) => isFM(c));
      const normal = chapters.filter((c) => !isFM(c) && !isBM(c.title));
      const bm = chapters.filter((c) => isBM(c.title));

      const next = [...fm, ...normal, created, ...bm];
      setChapters(next);

      if (selectAfterCreate) selectChapterIntoEditor(created);
      setMsg("✅ Chapter created.");
      return created;
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------
     UI helpers
  ----------------------------*/
  const loadChapter = (id) => {
    const chap = chapters.find((c) => c.id === id);
    if (chap) selectChapterIntoEditor(chap);
  };

  const toggleColumns = () => setIsTwoColumn((prev) => !prev);

  if (loadingList) {
    return <div className="p-6">Loading chapters…</div>;
  }

  // Sections for sidebar (use type for FM; title for BM)
  const frontMatterChapters = chapters.filter((c) => isFM(c));
  const normalChapters = chapters.filter((c) => !isFM(c) && !isBM(c.title));
  const backMatterChapters = chapters.filter((c) => isBM(c.title));
  const backMatterExists = backMatterChapters.length > 0;

  return (
    <div className="flex min-h-screen bg-gray-700">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/6 bg-gray-800 text-white p-4 sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-1 gap-2 mb-2">
          <ArrowLeft className="text-xs" />
          <p className="text-sm mb-2"> Back to dashboard</p>
        </div>
        <h2 className="text-md font-bold mb-4">{BOOK_TITLE}</h2>

        {/* Front Matter */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <div className="mb-4">
              <Disclosure.Button className="flex w-full justify-between items-center px-2 py-2 text-left font-semibold bg-gray-900 rounded">
                <span className="text-md">Front Matter</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
              </Disclosure.Button>
              <Disclosure.Panel>
                <ul className="mt-2 space-y-2">
                  {frontMatterChapters.map((ch) => (
                    <li
                      key={ch.id}
                      onClick={() => loadChapter(ch.id)}
                      className={`text-sm flex justify-between items-center px-2 py-1 rounded cursor-pointer ${
                        ch.id === currentId ? "bg-green-500 text-white" : "hover:bg-gray-700"
                      }`}
                    >
                      <span>{ch.title}</span>
                      <Eye className="h-4 w-4 text-gray-300" />
                    </li>
                  ))}
                </ul>
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>

        {/* Chapters */}
        <div>
          <div className="flex justify-between items-center px-2 py-2 font-semibold bg-gray-900 rounded">
            <span>Chapters</span>
            <PlusCircle
              onClick={() => handleCreateChapter(true)}
              className="h-5 w-5 text-gray-300 cursor-pointer hover:text-white"
              title="Add Chapter"
            />
          </div>

          <ul className="mt-2 space-y-2">
            {normalChapters.length === 0 && (
              <li className="text-xs text-gray-300 px-2">No chapters yet. Click + to add.</li>
            )}
            {normalChapters.map((ch) => (
              <li
                key={ch.id}
                onClick={() => loadChapter(ch.id)}
                className={`flex justify-between items-center px-2 py-1 rounded cursor-pointer ${
                  ch.id === currentId ? "bg-green-500 text-white" : "hover:bg-gray-700"
                }`}
              >
                <span className="truncate w-4/5">{ch.title}</span>
                <div className="flex gap-2">
                  <Trash
                    className={`h-4 w-4 cursor-pointer ${
                      deletingId === ch.id ? "opacity-50" : "text-gray-300 hover:text-red-400"
                    }`}
                    title={deletingId === ch.id ? "Deleting..." : "Delete"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deletingId) return;
                      handleDeleteChapter(ch.id);
                    }}
                  />
                  <Eye className="h-4 w-4 text-gray-300 cursor-pointer hover:text-white" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Back Matter (optional, create via +) */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <div className="mt-4">
              <Disclosure.Button className="flex w-full justify-between items-center px-2 py-2 text-left font-semibold bg-gray-900 rounded">
                <span className="text-md">Back Matter</span>
                <div className="flex items-center gap-2">
                  {!backMatterExists && (
                    <PlusCircle
                      onClick={handleCreateBackMatter}
                      className="h-5 w-5 text-gray-300 cursor-pointer hover:text-white"
                      title="Add Back Matter"
                    />
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
              </Disclosure.Button>
              <Disclosure.Panel>
                {backMatterExists ? (
                  <ul className="mt-2 space-y-2">
                    {backMatterChapters.map((ch) => (
                      <li
                        key={ch.id}
                        onClick={() => loadChapter(ch.id)}
                        className={`text-sm flex justify-between items-center px-2 py-1 rounded cursor-pointer ${
                          ch.id === currentId ? "bg-green-500 text-white" : "hover:bg-gray-700"
                        }`}
                      >
                        <span>{ch.title}</span>
                        <div className="flex gap-2">
                          <Trash
                            className={`h-4 w-4 cursor-pointer ${
                              deletingId === ch.id ? "opacity-50" : "text-gray-300 hover:text-red-400"
                            }`}
                            title={deletingId === ch.id ? "Deleting..." : "Delete"}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (deletingId) return;
                              handleDeleteChapter(ch.id);
                            }}
                          />
                          <Eye className="h-4 w-4 text-gray-300" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-300 mt-2 px-2">
                    No back matter yet. Click + to add one.
                  </p>
                )}
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      </div>

      {/* Editor Section */}
      <div className="flex-1 flex flex-col items-center">
        {/* Actions */}
        <div className="w-full items-center bg-gray-800 text-white px-6 py-3 flex flex-wrap gap-3 justify-end shadow-md sticky top-0 z-10">
          <div>
            {msg && (
              <div
                className={`px-3 w-2xl text-sm py-1 rounded ${
                  msg.startsWith("✅")
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-yellow-2 00 bg-yellow-50 text-yellow-700"
                }`}
              >
                {msg}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-2 font-bold text-sm text-white rounded shadow hover:underline disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-200 text-sm text-black font-bold rounded shadow hover:bg-blue-300"
          >
            Preview and Finish
          </button>
        </div>

        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg py-4 px-4 my-6">
          {/* Toolbar */}
          <Toolbar onFormat={formatText} onReset={resetEditor} onToggleColumns={setIsTwoColumn} />

          {/* Chapter Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter Title"
            className="w-full text-center text-4xl font-serif p-2 mb-3 focus:outline-none focus:ring-0 border-none bg-transparent"
          />

          {/* Editor */}
          <EditorArea
            editorRef={editorRef}
            content={content}
            setContent={setContent}
            isTwoColumn={isTwoColumn}
          />
        </div>
      </div>

      {/* Preview Modal */}
      {showModal && (
        <PreviewModal
          onClose={() => setShowModal(false)}
          bookTitle={BOOK_TITLE}
          author={AUTHOR_NAME}
          frontMatter={chapters.filter((c) => isFM(c))}
          chapters={chapters.filter((c) => !isFM(c) && !isBM(c.title))}
          backMatter={chapters.filter((c) => isBM(c.title))}
          apiBase={API}
          bookId={bookId}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}
