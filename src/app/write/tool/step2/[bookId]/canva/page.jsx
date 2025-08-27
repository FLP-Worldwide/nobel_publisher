"use client";

import { useEffect, useRef, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/editor/Toolbar";
import EditorArea from "@/app/components/editor/EditorArea";
import PreviewModal from "@/app/components/editor/PreviewModal";
import { Disclosure } from "@headlessui/react";
import { ArrowBigLeft, ArrowLeft, ChevronDown, Eye, PlusCircle, Trash } from "lucide-react";

export default function EditorPage({ params }) {
  const { bookId } = use(params); // dynamic id from URL
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
  const [isTwoColumn, setIsTwoColumn] = useState(false);
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

  const frontMatter = [
    "Dedication",
    "Foreword",

  ];


  const toggleColumns = () => {
    setIsTwoColumn((prev) => !prev);
  };


  return (
    <div className="flex min-h-screen bg-gray-700">


      {/* Sidebar */}
      <div className="hidden lg:block w-1/6 bg-gray-800 text-white p-4 sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-1 gap-2 mb-2"><ArrowLeft className="text-xs" />
          <p className="text-sm mb-2"> Back to dashboard</p>
        </div>
        <h2 className="text-md font-bold mb-4">And She Left...</h2>

        {/* Front Matter */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <div className="mb-4">
              <Disclosure.Button className="flex w-full justify-between items-center px-2 py-2 text-left font-semibold bg-gray-900 rounded">
                <span className="text-md">Front Matter</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Disclosure.Button>
              <Disclosure.Panel>
                <ul className="mt-2 space-y-2">
                  {frontMatter.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm flex justify-between items-center px-2 py-1 hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <span>{item}</span>
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
      {/* Header */}
      <div className="flex justify-between items-center px-2 py-2 font-semibold bg-gray-900 rounded">
        <span>Chapters</span>
        <PlusCircle 
        onClick={() => handleCreateChapter(true)}
        disabled={saving}
        className="h-5 w-5 text-gray-300 cursor-pointer hover:text-white" />
      </div>

      {/* Chapter List */}
      <ul className="mt-2 space-y-2">

      <li className='flex justify-between items-center px-2 py-1 rounded cursor-pointer' > <span className="truncate w-4/5"> Chapter - 1 </span> <div className="flex gap-2"> <Trash className="h-4 w-4 text-gray-300 cursor-pointer hover:text-red-400" /> <Eye className="h-4 w-4 text-gray-300 cursor-pointer hover:text-white" /> </div> </li>


        {chapters.map((ch, idx) => (
          <li
            key={ch.id}
            onClick={() => loadChapter(ch.id)}
            className={`flex justify-between items-center px-2 py-1 rounded cursor-pointer ${
              ch.id === currentId
                ? "bg-green-500 text-white"
                : "hover:bg-gray-700"
            }`}
          >
            <span className="truncate w-4/5">
              {idx + 1}. {ch.title}
            </span>
            <div className="flex gap-2">
              <Trash className="h-4 w-4 text-gray-300 cursor-pointer hover:text-red-400" />
              <Eye className="h-4 w-4 text-gray-300 cursor-pointer hover:text-white" />
            </div>
          </li>
        ))}
      </ul>
    </div>
      </div>

      {/* Editor Section */}

      <div className="flex-1 flex flex-col items-center">

        {/* Actions */}
        <div className="w-full items-center bg-gray-800 text-white px-6 py-3 flex flex-wrap gap-3 justify-end shadow-md sticky top-0 z-10">
        
          <div>
              {msg && (
                <div
                  className={`px-3 w-2xl text-sm  py-1 rounded ${
                    msg.startsWith("✅")
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-yellow-200 bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {msg}
                </div>
              )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-2 font-bold  text-sm text-white rounded shadow hover:underline disabled:opacity-70"
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
           
           <Toolbar onFormat={formatText} onReset={resetEditor} onToggleColumns={toggleColumns} />

            {/* Chapter Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chapter Title"
              className="w-full text-center text-4xl font-serif p-2 mb-3 
                        focus:outline-none focus:ring-0 border-none bg-transparent"
            />

            {/* Editor */}
            <EditorArea editorRef={editorRef} content={content} setContent={setContent} isTwoColumn={isTwoColumn} />

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
      </div>

    </div>
  );
}
