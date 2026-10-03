"use client";
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Feather, SlidersHorizontal, Send } from 'lucide-react';
export default function AuthorSidebar({ currentStep }) {
  const params = useParams();
  const search = useSearchParams();
  const value = params?.bookId ?? params?.id ?? search.get('id');
  const id = Array.isArray(value) ? value[0] : value;
  const steps = [
    ['information','The brief', id ? `/write/tool/${id}` : '/write/tool', BookOpen],
    ['content','Book studio', id ? `/write/tool/step2/${id}` : null, SlidersHorizontal],
    ['metadata','Publication details', id ? `/write/tool/step2/${id}/metadata` : null, Feather],
    ['pricing','Review & release', id ? `/write/tool/step2/${id}/pricing_info` : null, Send],
  ];
  return <header className="ui-workspace-nav"><div>
    <Link href="/author-dashboard" className="inline-flex shrink-0 items-center gap-2 font-semibold"><ArrowLeft size={15}/> Writing desk</Link>
    <nav aria-label="Book workspace">{steps.map(([key,label,href,Icon]) => href ? <Link key={key} href={href} aria-current={currentStep === key ? 'page' : undefined}><Icon size={14}/>{label}</Link> : <span key={key}><Icon size={14}/>{label}</span>)}</nav>
  </div></header>;
}
