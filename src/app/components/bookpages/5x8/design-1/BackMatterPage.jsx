"use client";

import { useMemo } from "react";
import { sanitizeManuscriptHtml } from "../../../editor/sanitizeHtml";
import PageShell from "./PageShell";

export default function BackMatterPage({ section, pageNumber, ...pageProps }) {
  const safeContent = useMemo(
    () => sanitizeManuscriptHtml(section?.content || ""),
    [section?.content]
  );
  return (
    <PageShell {...pageProps} pageNumber={pageNumber} safeClassName="leading-relaxed text-slate-900">
      {section?.title && section.pageIndex === 0 && (
        <h2 className="break-words text-center text-2xl font-bold leading-snug">{section.title}</h2>
      )}
      <div
        className={`manuscript-prose print-manuscript ${section?.title && section.pageIndex === 0 ? "mt-7" : ""}`}
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    </PageShell>
  );
}
