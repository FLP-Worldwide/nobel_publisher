"use client";
import { sanitizeManuscriptHtml } from "../../../editor/sanitizeHtml";
import { getBookStyle, manuscriptStyle, sectionHeadingHtml } from "@/utils/bookLayout";
import PageShell from "./PageShell";
export default function ChapterPage({ section, pageNumber, bookStyle = getBookStyle(), ...pageProps }) {
  return <PageShell {...pageProps} pageNumber={pageNumber}>
    <div className="book-typeset" style={manuscriptStyle(bookStyle)}>
      {section.pageIndex === 0 && <div dangerouslySetInnerHTML={{ __html: sectionHeadingHtml(section, bookStyle) }} />}
      <div className="manuscript-prose book-typeset flow-root" dangerouslySetInnerHTML={{ __html: sanitizeManuscriptHtml(section.content || "") }} />
    </div>
  </PageShell>;
}
