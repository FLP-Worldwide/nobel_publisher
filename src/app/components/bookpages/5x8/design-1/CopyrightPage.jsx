"use client";

import PageShell from "./PageShell";

export default function CopyrightPage({ copyright, ...pageProps }) {
  return (
    <PageShell {...pageProps} safeClassName="flex flex-col justify-end text-sm leading-relaxed text-slate-700">
      <p className="font-semibold text-slate-900">Copyright © Nobel Publishing House</p>
      <p>All rights reserved.</p>
      {copyright && <p className="mt-4 whitespace-pre-line">{copyright}</p>}
      <p className="mt-5 text-xs text-slate-500">Made on the Nobel Books publishing platform</p>
    </PageShell>
  );
}
