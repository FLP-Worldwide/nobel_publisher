"use client";
import React, { useMemo } from "react";
import TitlePage from "../bookpages/5x8/design-1/TitlePage";
import CopyrightPage from "../bookpages/5x8/design-1/CopyrightPage";
import ChapterPage from "../bookpages/5x8/design-1/ChapterPage";
import BackMatterPage from "../bookpages/5x8/design-1/BackMatterPage";
import BlankPage from "../bookpages/5x8/design-1/BlankPage";
import IndexPage from "../bookpages/5x8/design-1/IndexPage";

export default function BookPreview({ book, layout = "default" }) {
  // ————————————————————————————————————————————————
  // UTIL: estimate how many print pages a chapter needs
  // Adjust wordsPerPage for your font/size/leading.
  // ————————————————————————————————————————————————
  const wordsFromHtml = (html = "") =>
    (html || "")
      .replace(/<[^>]*>/g, " ")             // strip tags
      .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean).length;

  const estimatePages = (html = "", wordsPerPage = 350) => {
    const wc = wordsFromHtml(html);
    return Math.max(1, Math.ceil(wc / wordsPerPage)); // at least 1 page
  };

  // ————————————————————————————————————————————————
  // Build a dynamic TOC from chapters (excluding falsy)
  // We start content page numbers at 1 (front matter not counted).
  // ————————————————————————————————————————————————
  const indexChapters = useMemo(() => {
    const chapters = Array.isArray(book?.chapters) ? book.chapters : [];

    // If you need to exclude specific items (e.g., Dedication/Foreword),
    // tweak the filter below. Currently it includes whatever you pass in.
    const filtered = chapters.filter(
      (c) => c && c.title && typeof c.content === "string"
    );

    // Start page numbering for content at 1
    let runningPage = 1;
    const toc = filtered.map((c) => {
      const startPage = runningPage;
      const pages = estimatePages(c.content); // change to "1" if each chapter = 1 page
      runningPage += pages;
      return { title: c.title, page: startPage };
    });

    return toc;
  }, [book?.chapters]);

  // ————————————————————————————————————————————————
  // Pages to render (front matter + index + chapters + back matter)
  // TOC is now dynamic via indexChapters.
  // ————————————————————————————————————————————————
  const allPages = useMemo(() => {
    return [
      <TitlePage
        key="title"
        title={book.title}
        subtitle={book.subtitle}
        author={book.author}
      />,
      <CopyrightPage key="copyright" copyright={book.copyright} />,
      <BlankPage key="blank-1" />,
      <IndexPage key="toc" chapters={indexChapters} />,
      <BlankPage key="blank-2" />,
      ...(Array.isArray(book.chapters) ? book.chapters : []).map((ch) => (
        <ChapterPage key={ch.id ?? ch.title} chapter={ch} />
      )),
      <BackMatterPage key="backmatter" backmatter={book.backmatter} />,
      <BlankPage key="blank-end" />,
    ];
  }, [book, indexChapters]);

  return (
    <div className="flex flex-col w-full items-center mx-auto px-6 rounded-lg">
      <div className="w-full mx-auto bg-gray-50 p-6">
        <div className="flex flex-col gap-8">
          {allPages.map((page, i) => {
            // First page alone, last page alone if odd total
            if (i === 0 || (i === allPages.length - 1 && allPages.length % 2 !== 0)) {
              return (
                <div key={i} className="flex justify-center">
                  <div className="w-[600px] h-[800px] bg-white shadow-lg rounded overflow-hidden">
                    {page}
                  </div>
                </div>
              );
            }
            // Render two-up spreads
            if (i % 2 !== 0) {
              return (
                <div key={i} className="flex justify-center gap-4">
                  <div className="w-[600px] h-[800px] bg-white shadow-lg rounded overflow-hidden">
                    {allPages[i]}
                  </div>
                  {allPages[i + 1] && (
                    <div className="w-[600px] h-[800px] bg-white shadow-lg rounded overflow-hidden">
                      {allPages[i + 1]}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
