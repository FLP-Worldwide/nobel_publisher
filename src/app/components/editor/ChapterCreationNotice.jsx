"use client";

export default function ChapterCreationNotice({ notice, busy, onRetry, onRefresh, onDismiss }) {
  if (!notice) return null;
  const success = notice.kind === "success";
  return <div role={success ? "status" : "alert"} className={`mt-3 rounded-xl border p-4 ${success ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">{notice.title}</p><p className="mt-1 text-sm leading-6 opacity-85">{notice.detail}</p></div><button type="button" aria-label="Dismiss chapter message" onClick={onDismiss} className="rounded px-2 py-1 text-lg leading-none hover:bg-black/5">×</button></div>
    {(notice.retry || notice.refresh) && <div className="mt-3 flex flex-wrap gap-3">
      {notice.retry && <button type="button" disabled={busy} onClick={onRetry} className="rounded-lg bg-[#19334c] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Checking your chapter…" : "Try again"}</button>}
      {notice.refresh && <button type="button" disabled={busy} onClick={onRefresh} className="rounded-lg border border-current px-4 py-2 text-xs font-semibold disabled:opacity-50">Refresh chapter list</button>}
    </div>}
  </div>;
}
