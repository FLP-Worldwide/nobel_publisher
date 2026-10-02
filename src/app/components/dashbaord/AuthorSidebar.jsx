"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Feather, SlidersHorizontal, Send } from 'lucide-react';
export default function AuthorSidebar({ currentStep }) {
  const params = useParams();
  const value = params?.bookId ?? params?.id;
  const id = Array.isArray(value) ? value[0] : value;
  const steps = [
    ['information','The brief', id ? `/write/tool/${id}` : '/write/tool', BookOpen],
    ['content','Book studio', id ? `/write/tool/step2/${id}` : null, SlidersHorizontal],
    ['metadata','Publication details', id ? `/write/tool/step2/${id}/metadata` : null, Feather],
    ['pricing','Review & release', id ? `/write/tool/step2/${id}/pricing_info` : null, Send],
  ];
  return <div className="studio-navigation border-b border-stone-200 bg-[#fbfaf7] px-4 py-4 sm:px-8">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
      <Link href="/author-dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700"><ArrowLeft size={16}/> My writing desk</Link>
      <nav aria-label="Book workspace" className="flex max-w-full gap-1 overflow-x-auto">{steps.map(([key,label,href,Icon]) => href ? <Link key={key} href={href} aria-current={currentStep === key ? 'page' : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${currentStep === key ? 'bg-[#244d43] text-white' : 'text-stone-500 hover:bg-stone-100'}`}><Icon size={16}/>{label}</Link> : <span key={key} className="px-3 py-2.5 text-sm text-stone-400">{label}</span>)}</nav>
    </div>
  </div>;
}
