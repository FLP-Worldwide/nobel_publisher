"use client";
import { ArrowUpRight, BookOpen, CircleCheckBig, Clock3, PencilLine } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function UserHeroSection({ books = [], loading = false, error = "", onFilter }) {
  const { data: session } = useSession();
  const name = session?.user?.name?.trim()?.split(/\s+/)?.[0] || "Author";
  const stats = [
    ["All books", books.length, BookOpen, "ALL"],
    ["In progress", books.filter(b => b.status === "DRAFT").length, PencilLine, "DRAFT"],
    ["Under review", books.filter(b => b.status === "IN_REVIEW").length, Clock3, "IN_REVIEW"],
    ["Published", books.filter(b => b.status === "PUBLISHED").length, CircleCheckBig, "PUBLISHED"],
  ];
  return <section className="relative overflow-hidden border-b border-[#dce3d7] bg-[#edf1e8]">
    <div className="ui-shell relative !pb-8 !pt-10 sm:!pt-12">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#6e8371]">Your author workspace</p><h1 className="mt-3 font-serif text-3xl tracking-tight text-[#254a3b] sm:text-4xl">Good to see you, {name}.</h1><p className="mt-3 text-sm leading-6 text-[#6b7969]">A little progress today. A book to be proud of tomorrow.</p></div><Link href="/write/tool" className="inline-flex items-center gap-3 rounded-xl bg-[#284f3e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d3c2e]">Start a new book <ArrowUpRight size={17} /></Link></div>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(([label, value, Icon, filter]) => <button key={label} onClick={() => onFilter?.(filter)} className="rounded-xl border border-[#dbe2d3] bg-white/80 p-4 text-left transition hover:border-[#97af95] hover:bg-white sm:p-5"><div className="flex items-center justify-between text-[#84917e]"><span className="text-xs font-medium">{label}</span><Icon size={17} /></div><p className="mt-3 text-3xl font-semibold tabular-nums text-[#284f3e]">{loading || error ? "—" : value}</p></button>)}</div>
    </div>
  </section>;
}
