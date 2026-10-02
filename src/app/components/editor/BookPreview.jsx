"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenText, FileText, Ruler, Settings2 } from "lucide-react";
import TitlePage from "../bookpages/5x8/design-1/TitlePage";
import CopyrightPage from "../bookpages/5x8/design-1/CopyrightPage";
import ChapterPage from "../bookpages/5x8/design-1/ChapterPage";
import BackMatterPage from "../bookpages/5x8/design-1/BackMatterPage";
import BlankPage from "../bookpages/5x8/design-1/BlankPage";
import IndexPage from "../bookpages/5x8/design-1/IndexPage";
import { paginateByHeight } from "@/utils/pagination";
import { sanitizeManuscriptHtml } from "./sanitizeHtml";

const TRIM_SIZES = {
  FIVE_X_EIGHT: { label: "5 × 8 in", width: 5, height: 8 },
  FIVE_HALF_X_EIGHT_HALF: { label: "5.5 × 8.5 in", width: 5.5, height: 8.5 },
  SIX_X_NINE: { label: "6 × 9 in", width: 6, height: 9 },
  EIGHT_HALF_X_EIGHT_HALF: { label: "8.5 × 8.5 in", width: 8.5, height: 8.5 },
  EIGHT_HALF_X_ELEVEN: { label: "8.5 × 11 in", width: 8.5, height: 11 },
};

const DPI = 120;
const BLEED_INCHES = 0.125;
const SAFE_MARGIN_INCHES = 0.5;

export function getTrimSize(size) {
  return TRIM_SIZES[size] || TRIM_SIZES.FIVE_X_EIGHT;
}

function normalizeSections(book) {
  return [
    ...(book.frontmatter || []).map((section) => ({ ...section, group: "Front matter" })),
    ...(book.chapters || []).map((section) => ({ ...section, group: "Chapters" })),
    ...(book.backmatter || []).map((section) => ({ ...section, group: "Back matter" })),
  ].map((section, index) => ({
    ...section,
    id: section.id || `section-${index}`,
    title: section.title || "Untitled section",
    content: sanitizeManuscriptHtml(section.content || ""),
  }));
}

export default function BookPreview({ book }) {
  const [viewMode, setViewMode] = useState("reading");
  const [zoom, setZoom] = useState(60);
  const [showGuides, setShowGuides] = useState(false);
  const [pageData, setPageData] = useState({ pages: [], navigation: [], indexEntries: [] });
  const [paginating, setPaginating] = useState(true);

  const trim = getTrimSize(book?.trimSize || book?.design?.size || book?._raw?.design?.size);
  const sections = useMemo(() => normalizeSections(book || {}), [book]);
  const pageWidth = trim.width * DPI;
  const pageHeight = trim.height * DPI;

  useEffect(() => {
    setPaginating(true);
    const timer = window.requestAnimationFrame(() => {
      // Reserving heading space on every page is conservative, but guarantees
      // that chapter text is never hidden behind a first-page heading.
      const paginationHeight = Math.max(pageHeight - 130, 300);
      const groups = sections.map((section) => ({
        section,
        fragments: paginateByHeight(section.content || "<p></p>", pageWidth, paginationHeight),
      }));

      let printedPage = 1;
      let physicalPage = 6;
      const navigation = [{ label: "Title page", pageIndex: 0, sectionIndex: null }];
      const indexEntries = groups.map(({ section, fragments }, sectionIndex) => {
        navigation.push({
          label: section.title,
          group: section.group,
          pageIndex: physicalPage - 1,
          sectionIndex,
        });
        const entry = { title: section.title, page: printedPage };
        printedPage += Math.max(fragments.length, 1);
        physicalPage += Math.max(fragments.length, 1);
        return entry;
      });

      const pages = [
        { key: "title", kind: "title", label: "Title page" },
        { key: "copyright", kind: "copyright", label: "Copyright" },
        { key: "blank-before-contents", kind: "blank", label: "Blank page" },
        { key: "contents", kind: "contents", label: "Contents" },
        { key: "blank-after-contents", kind: "blank", label: "Blank page" },
      ];

      let pageNumber = 1;
      groups.forEach(({ section, fragments }, sectionIndex) => {
        (fragments.length ? fragments : [""]).forEach((fragment, fragmentIndex) => {
          pages.push({
            key: `${section.id}-${fragmentIndex}`,
            kind: section.group === "Back matter" ? "backmatter" : "section",
            label: fragmentIndex === 0 ? section.title : `${section.title}, continued`,
            section,
            sectionIndex,
            fragment,
            fragmentIndex,
            pageNumber,
          });
          pageNumber += 1;
        });
      });

      if (pages.length % 2 !== 0) {
        pages.push({ key: "blank-end", kind: "blank", label: "Blank page" });
      }
      setPageData({ pages, navigation, indexEntries });
      setPaginating(false);
    });
    return () => window.cancelAnimationFrame(timer);
  }, [pageHeight, pageWidth, sections]);

  const goTo = (item) => {
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
    safeMarginInches: SAFE_MARGIN_INCHES,
    showGuides,
  };

  const renderPage = (page) => {
    if (page.kind === "title") {
      return <TitlePage {...commonPageProps} title={book.title} subtitle={book.subtitle} author={book.author} />;
    }
    if (page.kind === "copyright") {
      return <CopyrightPage {...commonPageProps} copyright={book.copyright} />;
    }
    if (page.kind === "contents") {
      return <IndexPage {...commonPageProps} chapters={pageData.indexEntries} />;
    }
    if (page.kind === "blank") {
      return <BlankPage {...commonPageProps} />;
    }
    const section = {
      ...page.section,
      pageIndex: page.fragmentIndex,
      title: page.fragmentIndex === 0 ? page.section.title : null,
      content: page.fragment,
    };
    if (page.kind === "backmatter") {
      return <BackMatterPage {...commonPageProps} section={section} pageNumber={page.pageNumber} />;
    }
    return <ChapterPage {...commonPageProps} section={section} pageNumber={page.pageNumber} />;
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] items-start gap-6 px-3 py-5 sm:px-6">
      <aside className="book-preview-controls sticky top-20 hidden w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BookOpenText className="h-4 w-4 text-blue-600" aria-hidden="true" />
          Book contents
        </div>
        <nav className="mt-3 max-h-[42vh] space-y-1 overflow-y-auto pr-1" aria-label="Book contents">
          {pageData.navigation.map((item, index) => (
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
          <dl className="mt-3 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between gap-2"><dt>Trim size</dt><dd className="font-semibold text-slate-800">{trim.label}</dd></div>
            <div className="flex justify-between gap-2"><dt>Bleed</dt><dd className="font-semibold text-slate-800">0.125 in</dd></div>
            <div className="flex justify-between gap-2"><dt>Safe margin</dt><dd className="font-semibold text-slate-800">0.5 in</dd></div>
            <div className="flex justify-between gap-2"><dt>Pages</dt><dd className="font-semibold text-slate-800">{pageData.pages.length}</dd></div>
          </dl>
          {viewMode === "pages" && (
            <>
              <label className="mt-4 block text-xs font-medium text-slate-700" htmlFor="preview-zoom">Page zoom: {zoom}%</label>
              <input id="preview-zoom" className="mt-2 w-full accent-blue-600" type="range" min="45" max="100" step="5" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
              <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" checked={showGuides} onChange={(event) => setShowGuides(event.target.checked)} className="accent-blue-600" />
                Show trim safety guides
              </label>
            </>
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="book-preview-controls mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="inline-flex rounded-lg bg-slate-100 p-1" aria-label="Preview view">
            <button type="button" onClick={() => setViewMode("reading")} className={`rounded-md px-3 py-2 text-sm font-semibold ${viewMode === "reading" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"}`} aria-pressed={viewMode === "reading"}>
              Read all content
            </button>
            <button type="button" onClick={() => setViewMode("pages")} className={`rounded-md px-3 py-2 text-sm font-semibold ${viewMode === "pages" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"}`} aria-pressed={viewMode === "pages"}>
              Print layout
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 lg:hidden">
            <Ruler className="h-4 w-4" aria-hidden="true" /> {trim.label} · {pageData.pages.length} pages
          </div>
        </div>

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
                    <div className="manuscript-prose mt-6 font-serif text-base leading-8 text-slate-800 sm:text-lg" dangerouslySetInnerHTML={{ __html: section.content }} />
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
          <div className="book-print-pages space-y-7 overflow-x-auto rounded-2xl bg-slate-200 p-3 sm:p-6">
            {pageData.pages.map((page, index) => (
              <section id={`preview-page-${index}`} key={page.key} className="scroll-mt-28" aria-label={`Page ${index + 1}: ${page.label}`}>
                <div className="book-preview-page-scale mx-auto w-fit" style={{ zoom: zoom / 100 }}>
                  {renderPage(page)}
                </div>
                <p className="book-preview-controls mt-2 text-center text-xs font-medium text-slate-500">Page {index + 1} · {page.label}</p>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
