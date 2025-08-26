"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/editor/Toolbar";
import EditorArea from "@/app/components/editor/EditorArea";
import PreviewModal from "@/app/components/editor/PreviewModal";

export default function EditorPage({ params }) {
  const { bookId } = params; // dynamic id from URL
  const { data: session } = useSession();
  const router = useRouter();
  const accessToken = session?.user?.accessToken;

  const editorRef = useRef(null);

  // Data
  const [chapters, setChapters] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  // UI state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  /* ---------------------------
     Helpers
  ----------------------------*/
  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  });

  const selectChapterIntoEditor = (ch) => {
    setCurrentId(ch.id);
    setTitle(ch.title || "");
    setContent(ch.content || "<p></p>");
    if (editorRef.current) editorRef.current.innerHTML = ch.content || "<p></p>";
  };

  /* ---------------------------
     Load chapters on mount
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
        setChapters(data || []);

        if (data?.length) {
          selectChapterIntoEditor(data[0]);
        } else {
          // create first chapter if none exists
          await handleCreateChapter(true);
        }
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
     CRUD: Save current chapter
  ----------------------------*/
  const handleSave = async () => {
    if (!currentId) return;
    setSaving(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/chapters/${currentId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          title,
          content, // HTML
        }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated?.message || "Failed to save");

      // update local list
      setChapters((prev) => prev.map((c) => (c.id === currentId ? { ...c, title, content } : c)));
      setMsg("✅ Chapter saved.");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------
     CRUD: Create new chapter
  ----------------------------*/
  const handleCreateChapter = async (selectAfterCreate = false) => {
    setSaving(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/chapters/${bookId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: `Chapter ${chapters.length + 1} - Untitled`,
          type: "chapter", // matches your ChapterType enum
          content: "<p>Start new chapter...</p>",
        }),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created?.message || "Failed to create chapter");

      setChapters((prev) => [...prev, created]);
      if (selectAfterCreate) {
        selectChapterIntoEditor(created);
      }
      setMsg("✅ Chapter created.");
      return created;
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------
     Load a chapter into editor
  ----------------------------*/
  const loadChapter = (id) => {
    const chap = chapters.find((c) => c.id === id);
    if (chap) selectChapterIntoEditor(chap);
  };

  if (loadingList) {
    return <div className="p-6">Loading chapters…</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 p-6 gap-6">
      {/* Editor Section */}
      <div className="w-full lg:w-3/4 bg-white shadow-lg rounded-lg p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">📝 Chapter Editor</h1>

        {msg && (
          <div
            className={`mb-3 rounded border px-3 py-2 text-sm ${
              msg.startsWith("✅")
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-yellow-300 bg-yellow-50 text-yellow-700"
            }`}
          >
            {msg}
          </div>
        )}

        {/* Chapter Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chapter Title"
          className="w-full border p-2 rounded mb-3 text-lg font-semibold"
        />

        {/* Toolbar */}
        <Toolbar onFormat={formatText} onReset={resetEditor} />

        {/* Editor */}
        <EditorArea editorRef={editorRef} content={content} setContent={setContent} />

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-between mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-70"
          >
            💾 {saving ? "Saving…" : "Save"}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700"
          >
            👀 Preview PDF
          </button>

          <button
            onClick={() => handleCreateChapter(true)}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-70"
          >
            ➕ New Chapter
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <PreviewModal
            content={content}
            pdfUrl={pdfUrl}
            setPdfUrl={setPdfUrl}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-white shadow-lg rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2">📚 Chapters</h2>
        <ul className="space-y-2 text-gray-700">
          {chapters.map((ch) => (
            <li
              key={ch.id}
              onClick={() => loadChapter(ch.id)}
              className={`cursor-pointer p-2 rounded ${
                ch.id === currentId ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100"
              }`}
            >
              {ch.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
