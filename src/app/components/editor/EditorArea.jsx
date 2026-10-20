"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { sanitizeManuscriptHtml } from "./sanitizeHtml";
import { containsDevanagari, hasDetachedDevanagariMarks, prepareManuscriptPaste } from "./manuscriptPaste";
import { manuscriptStyle, sectionHeadingHtml, ensureBookFonts } from "@/utils/bookLayout";

export default function EditorArea({ editorRef, content, setContent, section, bookStyle, ariaLabel = "Chapter content", onTitleChange, toolbar }) {
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

  return <div className="writer-canvas">
    <div className="chapter-writing-scroll writer-scroll">
      <article lang={bookStyle.language} className="chapter-writing-sheet book-typeset writer-sheet" style={manuscriptStyle(bookStyle)}>
        {onTitleChange ? <header className="writer-section-heading">
          {section?.type === 'chapter' && <p className="writer-chapter-number">{section.number || 1}</p>}
          <label htmlFor="chapter-title" className="sr-only">Section title</label><input id="chapter-title" value={section?.title || ''} maxLength={200} onChange={event=>onTitleChange(event.target.value)} placeholder="Untitled section" className="writer-title"/>
        </header> : <div dangerouslySetInnerHTML={{ __html: sectionHeadingHtml(section, bookStyle) }}/>}
        {toolbar}
        <div ref={editorRef} lang={bookStyle.language === "hi" || containsDevanagari(content) ? "hi" : bookStyle.language} className="chapter-writing-editor manuscript-prose book-typeset writer-content" contentEditable suppressContentEditableWarning onInput={syncContent} onKeyDown={onKeyDown} onPaste={onPaste} role="textbox" aria-label={ariaLabel} aria-multiline="true" spellCheck="true"/>
        {pasteNotice&&<p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900">{pasteNotice}</p>}
        <footer className="writer-sheet-footer"><p>Enter for a paragraph · Shift + Enter for a line break</p><details className="writer-paste-settings"><summary>Paste settings</summary><label>Paste mode<select value={pasteMode} onChange={event=>setPasteMode(event.target.value)}><option value="auto">Auto · Hindi as plain text</option><option value="rich">Keep bold & paragraph formatting</option><option value="plain">Plain text</option></select></label></details></footer>
      </article>
    </div>
  </div>;
}
