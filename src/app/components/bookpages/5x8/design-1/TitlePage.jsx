"use client";

import PageShell from "./PageShell";

export default function TitlePage({ title, subtitle, author, ...pageProps }) {
  return (
    <PageShell {...pageProps} safeClassName="flex flex-col items-center justify-center px-4 text-center">
      <h1 className="break-words text-4xl font-bold leading-tight text-slate-950">{title || "Untitled book"}</h1>
      {subtitle && <h2 className="mt-4 text-lg italic leading-relaxed text-slate-600">{subtitle}</h2>}
      <div className="mt-9 h-px w-14 bg-slate-300" />
      <p className="mt-7 text-lg font-semibold text-slate-800">{author || "Author"}</p>
    </PageShell>
  );
}
