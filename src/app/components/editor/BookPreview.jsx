"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { BookOpenText, Ruler, Settings2 } from "lucide-react";
import TitlePage from "../bookpages/5x8/design-1/TitlePage";
import CopyrightPage from "../bookpages/5x8/design-1/CopyrightPage";
import ChapterPage from "../bookpages/5x8/design-1/ChapterPage";
import BackMatterPage from "../bookpages/5x8/design-1/BackMatterPage";
import BlankPage from "../bookpages/5x8/design-1/BlankPage";
import IndexPage from "../bookpages/5x8/design-1/IndexPage";
import { paginateByHeight } from "@/utils/pagination";
import { sanitizeManuscriptHtml } from "./sanitizeHtml";

import { BOOK_DPI as DPI, BOOK_BLEED as BLEED_INCHES, getTrimSize, getBookStyle, manuscriptStyle, measureHeading, ensureBookFonts, measureContentsChunks, ensureManuscriptImages } from "@/utils/bookLayout";
import ZoomControls from "./ZoomControls";
import BookCoverPreview from "./BookCoverPreview";
import { copyrightHtml } from "@/utils/copyright.mjs";
import { interiorMargins, interiorContentSize, assemblePrintPages, frontMatterOrder } from "@/utils/printLayout.mjs";
export { getTrimSize } from "@/utils/bookLayout";

const pageWidthFor = trim => trim.width * DPI;

function normalizeSections(book) {
  return [
    ...[...(book.frontmatter || [])].sort((a,b)=>frontMatterOrder(a.title)-frontMatterOrder(b.title)).map((section) => ({ ...section, group: "Front matter" })),
    ...(book.chapters || []).map((section) => ({ ...section, group: "Chapters" })),
    ...(book.backmatter || []).map((section) => ({ ...section, group: "Back matter" })),
  ].map((section, index) => ({
    ...section,
    id: section.id || `section-${index}`,
    title: section.title || "Untitled section",
    content: sanitizeManuscriptHtml(section.content || ""),
  }));
}

export default function BookPreview({ book, accessToken }) {
  const [viewMode, setViewMode] = useState("pages");
  const printArea = useRef(null);
  const [availableWidth, setAvailableWidth] = useState(900);
  const [zoom, setZoom] = useState("fit");
  const [contentsOpen, setContentsOpen] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [pageData, setPageData] = useState({ pages: [], navigation: [], indexEntries: [] });
  const [paginating, setPaginating] = useState(true);

  const design = book?.design || book?._raw?.design || {};
  const trim = getTrimSize(book?.trimSize || design.size, design);
  const bookStyle = getBookStyle(design.layoutStyle, book?.language || book?._raw?.language);
  const fitScale = Math.max(0.15, (availableWidth - 32) / (pageWidthFor(trim) * 2 + 16));
  const sections = useMemo(() => normalizeSections(book || {}), [book]);
  const pageWidth = trim.width * DPI;
  const pageHeight = trim.height * DPI;

  useEffect(() => {
    if (!printArea.current) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(printArea.current);
    return () => observer.disconnect();
  }, [viewMode, paginating]);

  useEffect(() => {
    setPaginating(true);
    let cancelled = false;
    const timer = window.requestAnimationFrame(async () => {
      await ensureBookFonts(bookStyle);
      await ensureManuscriptImages(sections);
      if (cancelled) return;
      const groups = sections.map((section) => ({
        section,
        fragments: paginateByHeight(section.content || "<p></p>", pageWidth, pageHeight, {
          margin: interiorMargins(1, DPI),
          typography: { ...manuscriptStyle(bookStyle), "--book-content-height": `${interiorContentSize(trim.width, trim.height, DPI).height - 24}px` },
          firstPageHeading: measureHeading(section, bookStyle, interiorContentSize(trim.width, trim.height, DPI).width),
        }),
      }));

      const contentHeight = interiorContentSize(trim.width, trim.height, DPI).height;
      const copyright = sanitizeManuscriptHtml(book.importedCopyright || copyrightHtml(book));
      const copyrightFragments = paginateByHeight(copyright, pageWidth, pageHeight, { margin: interiorMargins(2, DPI), typography: { ...manuscriptStyle(bookStyle), fontSize: "9pt", lineHeight: 1.5 } });
      setPageData(assemblePrintPages(groups, measureContentsChunks(sections, bookStyle, interiorContentSize(trim.width, trim.height, DPI).width, contentHeight), copyrightFragments));
      setPaginating(false);
    });
    return () => { cancelled = true; window.cancelAnimationFrame(timer); };
  }, [pageHeight, pageWidth, sections, bookStyle, book, trim.height, trim.width]);

  const goTo = (item) => {
    if (item.coverSide) { document.getElementById(`preview-${item.coverSide}-cover`)?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const targetId =
      viewMode === "reading"
        ? item.sectionIndex === null
          ? "preview-book-title"
          : `reading-section-${item.sectionIndex}`
        : `preview-page-${item.pageIndex}`;
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const commonPageProps = {
    trimWidthIn: trim.width,
    trimHeightIn: trim.height,
    dpi: DPI,
    bleedInches: BLEED_INCHES,
        showGuides,
    bookStyle,
  };

  const renderPage = (page, index) => {
    const pageProps = { ...commonPageProps, physicalPageNumber: index + 1 };
    if (page.kind === "title") {
      return <TitlePage {...pageProps} title={book.title} subtitle={book.subtitle} author={book.author} />;
    }
    if (page.kind === "copyright") {
      return <CopyrightPage {...pageProps} book={book} fragment={page.fragment} />;
    }
    if (page.kind === "contents") {
      return <IndexPage {...pageProps} chapters={page.entries} pageNumber={page.showPageNumber ? page.pageNumber : null} />;
    }
    if (page.kind === "blank") {
      return <BlankPage {...pageProps} />;
    }
    const section = {
      ...page.section,
      pageIndex: page.fragmentIndex,
      title: page.fragmentIndex === 0 ? page.section.title : null,
      content: page.fragment,
    };
    const runningHeader = page.fragmentIndex > 0 ? (page.section.group === "Chapters" ? ((index + 1) % 2 === 0 ? book.title : book.author) : page.section.title) : null;
    const folio = page.showPageNumber ? page.pageNumber : null;
    if (page.kind === "backmatter") {
      return <BackMatterPage {...pageProps} bookStyle={bookStyle} section={section} pageNumber={folio} runningHeader={runningHeader} />;
    }
    return <ChapterPage {...pageProps} bookStyle={bookStyle} section={section} pageNumber={folio} runningHeader={runningHeader} />;
  };

  return (
    <div className="book-preview-workspace flex w-full items-start gap-4 px-3 py-4 sm:px-5">
      {contentsOpen && <aside className="book-preview-controls sticky top-20 hidden w-56 shrink-0 rounded-xl border border-slate-200 bg-white p-4 lg:block">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BookOpenText className="h-4 w-4 text-blue-600" aria-hidden="true" />
          Book contents
        </div>
        <nav className="mt-3 max-h-[42vh] space-y-1 overflow-y-auto pr-1" aria-label="Book contents">
          {[{ label: "Front cover", coverSide: "front" }, ...pageData.navigation, { label: "Back cover", coverSide: "back" }].map((item, index) => (
            <button
              type="button"
              key={`${item.label}-${index}`}
              onClick={() => goTo(item)}
              className="block w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Settings2 className="h-4 w-4 text-blue-600" aria-hidden="true" />
            Preview settings
          </div>
          <p className="mt-3 text-xs text-slate-600">{bookStyle.name} · {bookStyle.points} pt</p>
          <dl className="mt-3 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between gap-2"><dt>Trim size</dt><dd className="font-semibold text-slate-800">{trim.label}</dd></div>
            <div className="flex justify-between gap-2"><dt>Bleed</dt><dd className="font-semibold text-slate-800">None · text interior</dd></div>
            <div className="flex justify-between gap-2"><dt>Inside / outside</dt><dd className="font-semibold text-slate-800">2.29 / 1.52 cm</dd></div>
            <div className="flex justify-between gap-2"><dt>Pages</dt><dd className="font-semibold text-slate-800">{pageData.pages.length}</dd></div>
          </dl>
          {viewMode === "pages" && (
            <>
              <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" checked={showGuides} onChange={(event) => setShowGuides(event.target.checked)} className="accent-blue-600" />
                Show margins and trim
              </label>
            </>
          )}
        </div>
      </aside>}

      <style>{`@media print { @page { size: ${trim.width}in ${trim.height}in; margin: 0; } }`}</style>
      <main className="min-w-0 flex-1">
        <div className="book-preview-controls sticky top-[64px] z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <button type="button" onClick={() => setContentsOpen(v => !v)} className="hidden rounded-lg px-3 py-2 text-xs font-semibold hover:bg-slate-100 lg:block" aria-pressed={contentsOpen}>{contentsOpen ? 'Hide contents' : 'Show contents'}</button>
          <select aria-label="Jump to section" className="max-w-40 rounded-lg border border-slate-200 p-2 text-xs lg:hidden" onChange={e => goTo(pageData.navigation[Number(e.target.value)])}>{pageData.navigation.map((item,i)=><option key={i} value={i}>{item.label}</option>)}</select>
          <div className="inline-flex rounded-lg bg-slate-100 p-1" aria-label="Preview view">
            <button type="button" onClick={() => setViewMode("reading")} className={`rounded-md px-3 py-2 text-sm font-semibold ${viewMode === "reading" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"}`} aria-pressed={viewMode === "reading"}>
              Read all content
            </button>
            <button type="button" onClick={() => setViewMode("pages")} className={`rounded-md px-3 py-2 text-sm font-semibold ${viewMode === "pages" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"}`} aria-pressed={viewMode === "pages"}>
              Print layout
            </button>
          </div>
          {viewMode === "pages" && <ZoomControls zoom={zoom} setZoom={setZoom} fitScale={fitScale} label="Preview zoom" />}
          <div className="flex items-center gap-2 text-xs text-slate-500 lg:hidden">
            <Ruler className="h-4 w-4" aria-hidden="true" /> {trim.label} · {pageData.pages.length} pages
          </div>
        </div>

        <BookCoverPreview book={book} side="front" accessToken={accessToken} width={Math.min(360, pageWidth)}/>
        {viewMode === "reading" ? (
          <article className="book-reading-view overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header id="preview-book-title" className="scroll-mt-28 border-b border-slate-200 bg-slate-50 px-5 py-12 text-center sm:px-12 sm:py-16">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Complete manuscript review</p>
              <h1 className="mt-4 font-serif text-3xl font-bold text-slate-950 sm:text-5xl">{book.title || "Untitled book"}</h1>
              {book.subtitle && <p className="mt-3 font-serif text-lg italic text-slate-600">{book.subtitle}</p>}
              <p className="mt-6 text-sm font-semibold text-slate-700">{book.author || "Author"}</p>
            </header>
            {sections.length ? (
              sections.map((section, index) => (
                <section id={`reading-section-${index}`} key={`${section.id}-${index}`} className="scroll-mt-28 border-b border-slate-100 px-5 py-9 last:border-b-0 sm:px-12 sm:py-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">{section.group}</p>
                  <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">{section.title}</h2>
                  {section.content ? (
                    <div className="manuscript-prose book-typeset mt-6" style={manuscriptStyle(bookStyle)} dangerouslySetInnerHTML={{ __html: section.content }} />
                  ) : (
                    <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">This section is currently empty.</p>
                  )}
                </section>
              ))
            ) : (
              <p className="p-10 text-center text-slate-500">No manuscript sections have been saved yet.</p>
            )}
          </article>
        ) : paginating ? (
          <div className="grid min-h-64 place-items-center rounded-2xl bg-white text-sm text-slate-500" role="status">Preparing every page…</div>
        ) : (
          <div ref={printArea} className="book-print-pages overflow-x-auto rounded-xl bg-[#e2e7eb] p-2 sm:p-4">
            <p className="book-preview-controls mb-4 text-center text-xs text-stone-600">Facing pages · even pages on the left, odd pages on the right</p>
            {Array.from({ length: Math.ceil((pageData.pages.length + 1) / 2) }, (_, spread) => {
              const indices = [spread * 2 - 1, spread * 2];
              const scale = zoom === "fit" ? fitScale : zoom / 100;
              return <div key={spread} className="print-spread mx-auto mb-6 flex gap-2" style={{ width: pageWidth * scale * 2 + 8 }}>
                {indices.map(index => {
                  const page = pageData.pages[index];
                  return <section id={page ? `preview-page-${index}` : undefined} key={index} className="print-leaf shrink-0 scroll-mt-28" style={{ width: pageWidth * scale }} aria-label={page ? `Page ${index + 1}: ${page.label}` : 'Outside of book'}>
                    {page ? <>
                      <div style={{ height: pageHeight * scale }}>
                        <div className="book-preview-page-scale" style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: pageWidth }}>{renderPage(page, index)}</div>
                      </div>
                      <p className="book-preview-controls mt-2 text-center text-xs text-stone-600">{index + 1} · {page.label}</p>
                    </> : <div className="book-preview-controls" style={{ height: pageHeight * scale }} />}
                  </section>;
                })}
              </div>;
            })}
          </div>
        )}
        <BookCoverPreview book={book} side="back" accessToken={accessToken} width={Math.min(360, pageWidth)}/>
        <p className="book-preview-controls py-4 text-center text-xs text-slate-500">Covers are separate from the numbered interior. The printer confirms the spine and final cover wrap.</p>
      </main>
    </div>
  );
}
