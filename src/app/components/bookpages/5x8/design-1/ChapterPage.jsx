"use client";

import { useMemo } from "react";
import { sanitizeManuscriptHtml } from "../../../editor/sanitizeHtml";
import PageShell from "./PageShell";

export default function ChapterPage({ section, pageNumber, ...pageProps }) {
  const safeContent = useMemo(
    () => sanitizeManuscriptHtml(section?.content || ""),
    [section?.content]
  );
  return (
    <PageShell {...pageProps} pageNumber={pageNumber} safeClassName="leading-relaxed text-slate-900">
      {section?.type === "chapter" && section.pageIndex === 0 && (
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Chapter {section.number || ""}
        </p>
      )}
      {section?.title && section.pageIndex === 0 && (
        <h2 className="mt-3 break-words text-center text-2xl font-bold leading-snug">{section.title}</h2>
      )}
      <div
        className={`manuscript-prose text-justify text-sm leading-6 ${section?.title && section.pageIndex === 0 ? "mt-7" : ""}`}
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    </PageShell>
  );
}
