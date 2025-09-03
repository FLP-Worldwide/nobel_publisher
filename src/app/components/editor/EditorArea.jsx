"use client";
import { useEffect } from "react";

export default function EditorArea({ editorRef, content, setContent, isTwoColumn }) {
  // ✅ Set initial content only once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [editorRef, content]);

  const handleInput = (e) => {
    let value = e.target.innerHTML;

    // If only <br> or empty HTML → reset to truly empty
    if (value === "<br>" || value.trim() === "") {
      value = "";
      e.target.innerHTML = "";
    }

    setContent(value);
  };

  return (
    <div
      ref={editorRef}
      className={`w-full min-h-screen px-12 py-4 bg-white focus:outline-none text-left text-lg font-serif placeholder-editor ${
        isTwoColumn ? "editor-two-col" : ""
      }`}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
    />
  );
}
