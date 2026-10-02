"use client";

import PageShell from "./PageShell";

export default function BlankPage({
  showNote = false,
  note = "This page intentionally left blank.",
  ...pageProps
}) {
  return (
    <PageShell {...pageProps} safeClassName="flex items-center justify-center">
      {showNote && <p className="px-6 text-center text-sm italic text-slate-400">{note}</p>}
    </PageShell>
  );
}
