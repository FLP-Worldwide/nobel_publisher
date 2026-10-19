"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { sanitizeManuscriptHtml } from "./sanitizeHtml";
import { containsDevanagari, hasDetachedDevanagariMarks, prepareManuscriptPaste } from "./manuscriptPaste";
import { manuscriptStyle, sectionHeadingHtml, ensureBookFonts } from "@/utils/bookLayout";

export default function EditorArea({ editorRef, content, setContent, section, bookStyle, ariaLabel = "Chapter content" }) {
  const [pasteMode, setPasteMode] = useState("auto");
  const [pasteNotice, setPasteNotice] = useState("");

  useLayoutEffect(() => {
    const editor = editorRef.current;
    // The browser owns the active selection and undo history. Do not replace
    // its DOM on each keystroke or autosave render.
    if (!editor || document.activeElement === editor) return;
    const safe = sanitizeManuscriptHtml(content);
    if (editor.innerHTML !== safe) editor.innerHTML = safe;
  }, [content, editorRef]);

  useEffect(() => { ensureBookFonts(bookStyle); }, [bookStyle]);

  const syncContent = () => setContent(sanitizeManuscriptHtml(editorRef.current.innerHTML));

  function onKeyDown(event) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      document.execCommand("insertHTML", false, '<div data-page-break="true"></div><p><br></p>');
    } else {
      // Native editing commands retain the caret and undo history. No page
      // measurements, column resizing or scroll-to-page happens while typing.
      document.execCommand(event.shiftKey ? "insertLineBreak" : "insertParagraph");
    }
    syncContent();
  }

  function onPaste(event) {
    event.preventDefault();
    const rich = event.clipboardData.getData("text/html");
    const plain = event.clipboardData.getData("text/plain");
    const safe = prepareManuscriptPaste({ html: rich, text: plain, mode: pasteMode });
    const pastedText = plain || new DOMParser().parseFromString(safe, "text/html").body.textContent;
    setPasteNotice(hasDetachedDevanagariMarks(pastedText)
      ? "This paste contains detached vowel marks or unreadable characters. Check the original text—copying from a PDF or an older Hindi font can change the characters. Undo and paste Unicode text from the original document if needed."
      : "");
    document.execCommand("insertHTML", false, safe);
    syncContent();
  }

  return <div className="bg-[#e2e7eb]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-medium text-slate-600">Continuous chapter editor</p>
      <label className="flex flex-wrap items-center gap-2 text-xs text-slate-600">Paste mode<select value={pasteMode} onChange={event => setPasteMode(event.target.value)} className="max-w-56 rounded border border-slate-300 bg-white px-2 py-1.5"><option value="auto">Auto · Hindi as plain text</option><option value="rich">Keep bold & paragraph formatting</option><option value="plain">Plain text</option></select></label>
    </div>
    <p className="px-5 py-3 text-xs leading-5 text-slate-600">Enter for a paragraph · Shift + Enter for a line break. Open Book Preview to see printed pages.</p>
    {pasteNotice && <p role="status" className="mx-5 mb-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900">{pasteNotice}</p>}
    <div className="chapter-writing-scroll p-3 sm:p-6">
      <article lang={bookStyle.language} className="chapter-writing-sheet book-typeset mx-auto w-full max-w-[960px] rounded-sm border border-slate-200 bg-white px-5 py-8 shadow-sm sm:px-12 sm:py-12" style={manuscriptStyle(bookStyle)}>
        <div dangerouslySetInnerHTML={{ __html: sectionHeadingHtml(section, bookStyle) }} />
        <div ref={editorRef} lang={bookStyle.language === "hi" || containsDevanagari(content) ? "hi" : bookStyle.language} className="chapter-writing-editor manuscript-prose book-typeset" contentEditable suppressContentEditableWarning onInput={syncContent} onKeyDown={onKeyDown} onPaste={onPaste} role="textbox" aria-label={ariaLabel} aria-multiline="true" spellCheck="true" />
      </article>
    </div>
  </div>;
}
