"use client";
import React, { useMemo } from "react";
import TitlePage from "../bookpages/5x8/design-1/TitlePage";
import CopyrightPage from "../bookpages/5x8/design-1/CopyrightPage";
import ChapterPage from "../bookpages/5x8/design-1/ChapterPage";
import BackMatterPage from "../bookpages/5x8/design-1/BackMatterPage";
import BlankPage from "../bookpages/5x8/design-1/BlankPage";
import IndexPage from "../bookpages/5x8/design-1/IndexPage";
import { paginateByHeight } from "@/utils/pagination";

export default function BookPreview({ book }) {
  const PAGE_WIDTH = 600;
  const PAGE_HEIGHT = 960;

  let pageCounter = 0;

  // ✅ TOC calculation
  const indexChapters = useMemo(() => {
    const sections = [
      ...(book.frontmatter || []),
      ...(book.chapters || []),
      ...(book.backmatter || []),
    ];

    let runningPage = 1;
    return sections.map((s) => {
      const numPages = paginateByHeight(s.content, PAGE_WIDTH, PAGE_HEIGHT).length;
      const startPage = runningPage;
      runningPage += numPages;
      return { title: s.title, page: startPage };
    });
  }, [book]);


  // ✅ Build all pages
  const allPages = useMemo(() => {
    const pages = [
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
    ];


  const indexEndIdx = pages.length - 1;
  
    const renderSection = (section, Component) => {
      const sectionPages = paginateByHeight(section.content, PAGE_WIDTH, PAGE_HEIGHT);
      return sectionPages.map((pageContent, idx) => {
        pageCounter++;
        return (
          <Component
            key={`${section.id ?? section.title}-page-${idx}`}
            section={{
              ...section,
              pageIndex: idx,
              title: idx === 0 ? section.title : null,
              content: pageContent,
            }}
            // ✅ add pageNumber only if past index
            pageNumber={pageCounter > indexEndIdx ? pageCounter : null}
          />
        );
      });
    };

    (book.frontmatter || []).forEach((fm) =>
      pages.push(...renderSection(fm, ChapterPage))
    );
    (book.chapters || []).forEach((ch) =>
      pages.push(...renderSection(ch, ChapterPage))
    );
    (book.backmatter || []).forEach((bm) =>
      pages.push(...renderSection(bm, BackMatterPage))
    );

    pages.push(<BlankPage key="blank-end" />);
    return pages;
  }, [book, indexChapters]);

  // ✅ Render spreads
  return (
    <div className="flex flex-col w-full items-center mx-auto px-6 rounded-lg">
      <div className="w-full mx-auto bg-gray-50 p-6">
        <div className="flex flex-col gap-8">
          {allPages.map((page, i) => {
            if (
              i === 0 ||
              (i === allPages.length - 1 && allPages.length % 2 !== 0)
            ) {
              return (
                <div key={i} className="flex justify-center">
                  <div
                    className="bg-white shadow-lg rounded overflow-hidden"
                    style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
                  >
                    {page}
                  </div>
                </div>
              );
            }
            if (i % 2 !== 0) {
              return (
                <div key={i} className="flex justify-center gap-4">
                  <div
                    className="bg-white shadow-lg rounded overflow-hidden"
                    style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
                  >
                    {allPages[i]}
                  </div>
                  {allPages[i + 1] && (
                    <div
                      className="bg-white shadow-lg rounded overflow-hidden"
                      style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
                    >
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
