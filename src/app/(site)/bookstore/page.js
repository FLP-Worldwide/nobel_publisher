import Link from "next/link";
import { BookOpen, PenLine, ShieldCheck } from "lucide-react";
import BookCarousel from "../../components/frontend/BookCarousel";

export default function Bookstore() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Independent books, directly from authors</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Discover books published through Nobel Books</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Every title shown here has completed the review and publishing process. Browse the current catalogue or start writing your own book.</p>
          </div>
          <Link href="/write/tool" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 font-bold text-slate-950 hover:bg-amber-300">
            <PenLine className="h-5 w-5" /> Start your book
          </Link>
        </div>
      </section>

      <BookCarousel heading="All published books" />

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
          <div className="flex gap-4"><BookOpen className="mt-1 h-6 w-6 shrink-0 text-blue-800" /><div><h2 className="font-bold text-slate-950">Clear book information</h2><p className="mt-1 text-sm leading-6 text-slate-600">See the author, edition format, description, categories, and price before ordering.</p></div></div>
          <div className="flex gap-4"><ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-blue-800" /><div><h2 className="font-bold text-slate-950">Reviewed before publication</h2><p className="mt-1 text-sm leading-6 text-slate-600">Books become public only after review approval and verified publishing payment.</p></div></div>
        </div>
      </section>
    </main>
  );
}
