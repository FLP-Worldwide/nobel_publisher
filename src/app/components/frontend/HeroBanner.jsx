import Link from "next/link";
import { BookOpenText, CheckCircle2, IndianRupee, ScanText } from "lucide-react";

const journey = [
  { icon: BookOpenText, title: "Write", text: "Build your book chapter by chapter in a private workspace." },
  { icon: ScanText, title: "Preview", text: "Check the complete interior and every section before submission." },
  { icon: CheckCircle2, title: "Review", text: "Receive an editorial decision and clear change notes." },
  { icon: IndianRupee, title: "Publish", text: "Pay ₹199 only after approval, then order author copies." },
];

export default function HeroBanner() {
  return (
    <section className="bg-white px-4 py-6 sm:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-100 bg-[radial-gradient(circle_at_top_right,_#dbeafe,_#fff_55%)] px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-900">
              Self-publishing for authors
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Take your book from first draft to published.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Write in one place, inspect the complete book preview, submit it for editorial review, and pay a simple ₹199 publishing fee only after approval.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/write/tool" className="rounded-xl bg-blue-950 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-900">
                Start writing →
              </Link>
              <Link href="/bookstore" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50">
                Browse published books
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">No publishing fee before approval. Your draft remains private.</p>
          </div>

          <ol className="grid gap-3 sm:grid-cols-2" aria-label="How publishing works">
            {journey.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="rounded-xl bg-blue-950 p-2 text-white"><Icon className="h-5 w-5" /></span>
                  <span className="text-xs font-black text-slate-300">0{index + 1}</span>
                </div>
                <h2 className="mt-4 font-bold text-slate-950">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
