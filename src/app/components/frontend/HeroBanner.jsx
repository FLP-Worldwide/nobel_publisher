import Link from "next/link";
import { ArrowUpRight, ArrowRight, BookOpen, Check, Feather, ShieldCheck } from "lucide-react";

export default function HeroBanner() {
  return <section className="relative overflow-hidden border-b border-[#e9e2d6] bg-[#f7f3eb]">
    <div className="pointer-events-none absolute -right-24 -top-48 h-[650px] w-[650px] rounded-full border border-[#ddd5c6]" aria-hidden="true" />
    <div className="ui-shell relative grid items-center gap-12 !py-14 sm:!py-20 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#527568]"><span className="h-2 w-2 rounded-full bg-[#527568]" /> Affordable self-publishing for authors</p>
        <h1 className="mt-6 max-w-xl font-serif text-5xl leading-[1.08] tracking-tight text-[#183d36] sm:text-6xl lg:text-7xl">Self-publish your book.<br /><em className="font-normal text-[#a4673c]">Keep costs simple.</em></h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-[#63695f]">Write your manuscript, design your cover and preview your book for free. Submit for a one-time ₹199 review fee, then set your price and publish after approval.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/login/create" className="inline-flex items-center gap-3 rounded-xl bg-[#214d40] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#17392f]">Start my book <ArrowUpRight size={18} /></Link><Link href="#publishing-costs" className="inline-flex items-center gap-3 rounded-xl border border-[#ccc7b9] px-6 py-3.5 text-sm font-semibold text-[#214d40] hover:bg-white">See publishing costs <ArrowRight size={16} /></Link></div>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#62695f]">{["Free writing & design tools", "₹199 review fee per book", "No bulk stock required"].map(text => <span key={text} className="flex items-center gap-1.5"><Check size={14} className="text-[#527568]" />{text}</span>)}</div>
      </div>
      <div className="relative mx-auto w-full max-w-[440px]" aria-label="Illustration of a book progressing from manuscript to publication">
        <div className="absolute inset-x-4 bottom-8 top-6 rounded-full bg-[#e2e8d9]" />
        <div className="relative mx-auto flex h-[340px] w-[230px] rotate-[-8deg] flex-col justify-between rounded-r-xl border-l-[12px] border-[#a26942] bg-[#bb8053] p-7 text-[#fff6e7] shadow-[18px_25px_40px_-15px_#434c3d66] sm:h-[380px] sm:w-[255px]">
          <Feather size={30} strokeWidth={1} /><div><p className="text-[10px] uppercase tracking-[.25em]">The story only you can tell</p><p className="mt-5 font-serif text-5xl leading-[1.1]">Your next<br />chapter.</p><div className="my-6 h-px w-10 bg-[#f3d6ac]" /><p className="text-xs tracking-[.12em]">WRITTEN BY YOU</p></div><p className="text-[9px] uppercase tracking-[.3em]">Nobel Books</p>
        </div>
        <div className="absolute -right-1 top-10 flex items-center gap-3 rounded-xl border border-[#e0e3d7] bg-white px-4 py-3 shadow-sm sm:-right-4"><span className="rounded-full bg-[#eaf2e8] p-2 text-[#426d51]"><ShieldCheck size={18} /></span><div><p className="text-xs font-bold text-[#263e34]">One-time review fee</p><p className="mt-1 text-[10px] text-slate-500">₹199 per book · revisions included</p></div></div>
        <div className="absolute -left-1 bottom-0 flex items-center gap-3 rounded-xl border border-[#e1dfd6] bg-white px-5 py-4 shadow-sm sm:-left-3"><BookOpen size={22} className="text-[#a4673c]" /><div><p className="text-xs font-bold text-[#263e34]">From draft to printed book</p><p className="mt-1 text-[10px] text-slate-500">Print on demand. No upfront stock.</p></div></div>
      </div>
    </div>
    <div className="border-t border-[#e9e2d6] bg-[#eeeae0]"><div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-[#596153]"><span><strong className="text-[#244d40]">Free to create. ₹199 to submit for review.</strong> Printing, shipping and retail commission are separate.</span><a href="#how-it-works" className="flex items-center gap-2 font-bold text-[#244d40]">See how publishing works <ArrowRight size={14} /></a></div></div>
  </section>;
}
