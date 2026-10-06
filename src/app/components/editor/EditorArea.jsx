"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sanitizeManuscriptHtml } from "./sanitizeHtml";
import { BOOK_DPI, BOOK_MARGIN, manuscriptStyle, sectionHeadingHtml, ensureBookFonts } from "@/utils/bookLayout";
import ZoomControls from "./ZoomControls";

export default function EditorArea({ editorRef, content, setContent, section, bookStyle, trim, ariaLabel = "Chapter content" }) {
  const scrollRef = useRef(null);
  const columnsRef = useRef(null);
  const [width, setWidth] = useState(1000);
  const [zoom, setZoom] = useState('fit');
  const [pages, setPages] = useState(1);
  const [visiblePage, setVisiblePage] = useState(1);
  const pageWidth = trim.width * BOOK_DPI, pageHeight = trim.height * BOOK_DPI;
  const margin = BOOK_MARGIN * BOOK_DPI, gap = 24;
  const bodyWidth = pageWidth - margin * 2;
  // Fit one comfortably sized writing page. Zoom is a view transform only.
  const fitScale = Math.max(.25, Math.min(1.3, (width - 48) / pageWidth));
  const scale = zoom === 'fit' ? fitScale : zoom / 100;
  const stride = (pageWidth + gap) * scale;
  const totalWidth = pages * (pageWidth + gap) - gap;

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const safe = sanitizeManuscriptHtml(content);
    if (editor.innerHTML !== safe) editor.innerHTML = safe;
  }, [content, editorRef]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const update = () => {
      if (cancelled || !columnsRef.current) return;
      const count = Math.max(1, Math.round((columnsRef.current.scrollWidth + margin * 2 + gap) / (pageWidth + gap)));
      setPages(count);
    };
    const frame = requestAnimationFrame(update);
    ensureBookFonts(bookStyle).then(update);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [content, section.title, section.type, section.number, bookStyle, pageWidth, pageHeight, margin]);

  const handleInput = event => setContent(sanitizeManuscriptHtml(event.currentTarget.innerHTML));

  function onKeyDown(event) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    // Native line-break editing retains the browser selection and undo history.
    // A second Enter creates the blank line separating two paragraphs.
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      document.execCommand('insertHTML', false, '<div data-page-break="true"></div><p><br></p>');
    } else {
      const selection = window.getSelection();
      if (selection?.isCollapsed && selection.rangeCount) {
        const preceding = selection.getRangeAt(0).cloneRange();
        preceding.selectNodeContents(editorRef.current);
        preceding.setEnd(selection.anchorNode, selection.anchorOffset);
        const fragment = preceding.cloneContents();
        const leaves = [];
        const visit = node => {
          if (node.nodeType === Node.TEXT_NODE || node.nodeName === 'BR') leaves.push(node);
          else node.childNodes.forEach(visit);
        };
        visit(fragment);
        let breaks = 0;
        for (const node of leaves.reverse()) {
          if (node.nodeName === 'BR') breaks++;
          else if (node.textContent.trim()) break;
        }
        if (breaks >= 2) return;
      }
      document.execCommand('insertLineBreak');
    }
    setContent(sanitizeManuscriptHtml(editorRef.current.innerHTML));
  }

  function onPaste(event) {
    event.preventDefault();
    const rich = event.clipboardData.getData('text/html');
    const plain = event.clipboardData.getData('text/plain');
    const safe = rich ? sanitizeManuscriptHtml(rich) : plain.replace(/[&<>]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;'}[c])).replace(/\r\n?/g,'\n').replace(/\n{3,}/g,'\n\n').replace(/\n/g,'<br>');
    document.execCommand('insertHTML', false, safe);
    setContent(sanitizeManuscriptHtml(editorRef.current.innerHTML));
  }

  function goTo(page) {
    const next = Math.max(1, Math.min(pages, page));
    scrollRef.current.scrollTo({ left: (next - 1) * stride, behavior: 'smooth' });
    setVisiblePage(next);
  }

  return <div className="bg-[#e2e7eb]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <button type="button" className="rounded border px-2 py-1 disabled:opacity-30" onClick={() => goTo(visiblePage - 1)} disabled={visiblePage <= 1} aria-label="Previous canvas page">←</button>
        <span>Page {Math.min(visiblePage, pages)} of {pages}</span>
        <button type="button" className="rounded border px-2 py-1 disabled:opacity-30" onClick={() => goTo(visiblePage + 1)} disabled={visiblePage >= pages} aria-label="Next canvas page">→</button>
        <span className="ml-2 hidden sm:inline">{trim.label} · {bookStyle.points} pt</span>
      </div>
      <ZoomControls zoom={zoom} setZoom={setZoom} fitScale={fitScale} />
    </div>
    <p className="px-5 py-2 text-xs text-slate-600">Enter for a new line · Enter twice for a paragraph · Page break for a fresh page. Pages flow to the right.</p>
    <div ref={scrollRef} className="book-canvas-scroll w-full p-5" onScroll={e => setVisiblePage(Math.min(pages, Math.floor(e.currentTarget.scrollLeft / stride) + 1))}>
      <div style={{ width: totalWidth * scale, height: pageHeight * scale, marginInline: totalWidth * scale < width - 40 ? 'auto' : 0 }}>
        <div style={{ width: totalWidth, height: pageHeight, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative' }}>
          {Array.from({length: pages}, (_,index) => <div key={index} className="pointer-events-none absolute top-0 border border-slate-200 bg-white shadow-md" style={{ left: index * (pageWidth + gap), width: pageWidth, height: pageHeight }} aria-hidden="true">
            <span className="absolute bottom-4 right-6 text-[10px] text-slate-400">{index + 1}</span>
          </div>)}
          <div ref={columnsRef} className="book-canvas-columns book-typeset absolute" style={{ ...manuscriptStyle(bookStyle), top: margin, left: margin, width: bodyWidth, height: pageHeight - margin * 2, columnWidth: bodyWidth, columnGap: margin * 2 + gap }}>
            <div dangerouslySetInnerHTML={{ __html: sectionHeadingHtml(section, bookStyle) }} />
            <div ref={editorRef} className="book-canvas-content manuscript-prose book-typeset" contentEditable suppressContentEditableWarning onInput={handleInput} onKeyDown={onKeyDown} onPaste={onPaste} role="textbox" aria-label={ariaLabel} aria-multiline="true" spellCheck="true" />
          </div>
        </div>
      </div>
    </div>
  </div>;
}
