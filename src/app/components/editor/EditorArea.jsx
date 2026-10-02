"use client";

import { useEffect } from "react";
import { sanitizeManuscriptHtml } from "./sanitizeHtml";

export default function EditorArea({
  editorRef,
  content,
  setContent,
  isTwoColumn,
  ariaLabel = "Chapter content",
}) {
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const safeContent = sanitizeManuscriptHtml(content);
    if (editor.innerHTML !== safeContent) editor.innerHTML = safeContent;
  }, [content, editorRef]);

  const handleInput = (event) => {
    let value = event.currentTarget.innerHTML;
    if (value === "<br>" || !value.trim()) {
      value = "";
      event.currentTarget.innerHTML = "";
    }
    setContent(sanitizeManuscriptHtml(value));
  };

  return (
    <div
      ref={editorRef}
      className={`placeholder-editor manuscript-editor w-full bg-white px-5 py-8 font-serif text-base leading-8 text-slate-800 outline-none sm:px-12 sm:py-10 sm:text-lg ${
        isTwoColumn ? "editor-two-col" : ""
      }`}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      role="textbox"
      aria-label={ariaLabel}
      aria-multiline="true"
      spellCheck="true"
    />
  );
}
