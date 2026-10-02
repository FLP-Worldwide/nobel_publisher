"use client";

import PageShell from "./PageShell";

export default function IndexPage({ chapters = [], heading = "Contents", ...pageProps }) {
  return (
    <PageShell {...pageProps} safeClassName="flex flex-col text-slate-900">
      <h2 className="text-center text-2xl font-bold">{heading}</h2>
      <div className="mt-9 flex-1 space-y-3 overflow-hidden">
        {chapters.length ? (
          chapters.map((chapter, index) => (
            <div key={`${chapter.title}-${index}`} className="flex items-end gap-2 text-sm leading-relaxed">
              <span className="min-w-0 break-words">{chapter.title || "Untitled section"}</span>
              <span className="mb-1 min-w-5 flex-1 border-b border-dotted border-slate-300" aria-hidden="true" />
              <span className="tabular-nums">{chapter.page}</span>
            </div>
          ))
        ) : (
          <p className="text-center text-sm italic text-slate-500">No sections yet</p>
        )}
      </div>
    </PageShell>
  );
}
