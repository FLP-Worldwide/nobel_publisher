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

  return <section className="border-b border-slate-200 bg-[#e8eef2]"><div className="ui-shell !py-7"><div className="grid items-center gap-6 lg:grid-cols-[1fr_1.15fr]"><div className="ui-heading !mb-0"><div><p className="ui-eyebrow">Nobel / Author workspace</p><h1>Welcome back, {firstName}.</h1><p>A clear view of your books, drafts and next steps.</p></div></div><dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{stats.map(({label,value,icon:Icon})=><div key={label} className="rounded-lg border border-slate-200 bg-white px-4 py-3"><div className="flex items-center justify-between text-slate-400"><dt className="text-[11px] font-medium">{label}</dt><Icon size={14}/></div><dd className="mt-2 text-xl font-semibold text-[#19334c]">{loading?'—':value}</dd></div>)}</dl></div></div></section>;
}
