"use client";
import { useEffect } from "react";

export default function EditorArea({ editorRef, content, setContent }) {
    // ✅ Set initial content only once
    useEffect(() => {
        if (editorRef.current && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = content;
        }
    }, [editorRef, content]);

    return (
        <div
            ref={editorRef}
            className="w-full min-h-[500px] border p-4 rounded-lg bg-white shadow-sm focus:outline-none text-left"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setContent(e.target.innerHTML)}
        />
    );
}
