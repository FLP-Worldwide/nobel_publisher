"use client";

import { ArrowLeft, Check, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function AuthorSidebar({ currentStep }) {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();

  const bookId = useMemo(() => {
    const value = params?.bookId ?? params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const steps = [
    {
      id: "information",
      label: "Book information",
      description: "Title, author and language",
      href: bookId ? `/write/tool/${bookId}` : "/write/tool",
    },
    {
      id: "content",
      label: "Design and content",
      description: "Print setup, manuscript and cover",
      href: bookId ? `/write/tool/step2/${bookId}` : null,
    },
    {
      id: "metadata",
      label: "Book details",
      description: "Blurb, categories and keywords",
      href: bookId ? `/write/tool/step2/${bookId}/metadata` : null,
    },
    {
      id: "pricing",
      label: "Review & publish",
      description: "Review status and ₹199 fee",
      href: bookId ? `/write/tool/step2/${bookId}/pricing_info` : null,
    },
  ];

  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentStep)
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-[60] inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-bold text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 lg:hidden"
        onClick={() => setOpen((value) => !value)}
        aria-controls="author-publishing-sidebar"
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        {open ? "Close" : "Steps"}
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close publishing steps"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="author-publishing-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:w-64 lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-5 py-6">
          <Link
            href="/author-dashboard"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Author dashboard
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Publishing workspace</p>
          <p className="mt-2 truncate text-lg font-bold text-white">{bookId ? `Book #${bookId}` : "New book"}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Book publishing steps">
          <ol className="space-y-2">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isVisited = index < activeIndex;
              const enabled = Boolean(step.href);
              const content = (
                <>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                      isActive
                        ? "border-white bg-white text-blue-800"
                        : isVisited
                          ? "border-emerald-400 bg-emerald-400 text-slate-950"
                          : "border-white/25 bg-white/5 text-slate-300"
                    }`}
                  >
                    {isVisited ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-bold ${isActive ? "text-white" : "text-slate-200"}`}>{step.label}</span>
                    <span className={`mt-0.5 block text-xs leading-5 ${isActive ? "text-blue-100" : "text-slate-400"}`}>{step.description}</span>
                  </span>
                  {enabled && <ChevronRight className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} aria-hidden="true" />}
                </>
              );

              return (
                <li key={step.id}>
                  {enabled ? (
                    <Link
                      href={step.href}
                      aria-current={isActive ? "step" : undefined}
                      className={`flex min-h-16 items-center gap-3 rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        isActive ? "bg-blue-700" : "hover:bg-white/10"
                      }`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="flex min-h-16 cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 opacity-50" aria-disabled="true">
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="border-t border-white/10 p-5 text-xs leading-5 text-slate-400">
          Save your work at each step. You can return from the dashboard at any time.
        </div>
      </aside>
    </>
  );
}
