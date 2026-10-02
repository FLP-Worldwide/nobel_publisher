"use client";

import { BookOpen, CircleCheckBig, Clock3, PencilLine } from "lucide-react";
import { useSession } from "next-auth/react";

export default function UserHeroSection({ books = [], loading = false }) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.trim()?.split(/\s+/)?.[0] || "Author";

  const counts = books.reduce(
    (result, book) => {
      const status = String(book?.status || "DRAFT").toUpperCase();
      if (status === "PUBLISHED") result.published += 1;
      else if (status === "IN_REVIEW") result.inReview += 1;
      else if (["CHANGES_REQUESTED", "APPROVED", "PAYMENT_PENDING"].includes(status)) result.needsAction += 1;
      else result.drafts += 1;
      return result;
    },
    { drafts: 0, inReview: 0, needsAction: 0, published: 0 }
  );

  const stats = [
    { label: "Drafts", value: counts.drafts, icon: PencilLine, color: "text-slate-700", background: "bg-slate-100" },
    { label: "In review", value: counts.inReview, icon: Clock3, color: "text-amber-700", background: "bg-amber-100" },
    { label: "Need your action", value: counts.needsAction, icon: BookOpen, color: "text-blue-700", background: "bg-blue-100" },
    { label: "Published", value: counts.published, icon: CircleCheckBig, color: "text-emerald-700", background: "bg-emerald-100" },
  ];

  return (
    <section className="border-b border-stone-200 bg-[#f5f3ee] text-stone-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.9fr)] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#517b6b]">Nobel / Writing desk</p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Your next chapter, {firstName}.</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-stone-500">
              Write, preview, submit, and track every book from one clear publishing workspace.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-stone-200 bg-white p-4 backdrop-blur-sm">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.background} ${stat.color}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <dd className="mt-3 text-2xl font-bold text-stone-900">{loading ? "—" : stat.value}</dd>
                  <dt className="mt-1 text-xs font-medium leading-5 text-stone-500">{stat.label}</dt>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
