"use client";
import { PRINT_CHOICES } from "@/utils/printOptions.mjs";
import PrintOptionCard from "@/app/components/editor/PrintOptionCard";
import ManuscriptGuide from "@/app/components/editor/ManuscriptGuide";
import { getBookStyle } from "@/utils/bookLayout";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowUpRight, BookOpen, Check } from 'lucide-react';
import AuthorSidebar from '@/app/components/dashbaord/AuthorSidebar';
import BookEditGuard from '@/app/components/dashbaord/BookEditGuard';
import SignedS3Image from '@/app/components/SignedS3Image';
const API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
function Studio({id}) {
 const {data:session}=useSession(); const token=session?.user?.accessToken;
 const [design,setDesign]=useState({size:'FIVE_X_EIGHT',bindingType:'PAPERBACK',interior:'BLACK_WHITE',paperType:'CREAM',coverLamination:'MATTE'});
 const [notice,setNotice]=useState(''); const [saving,setSaving]=useState(false);
 const {data:book,error,mutate}=useSWR(token?[`${API}/books/${id}`,token]:null,async([url,t])=>{const r=await fetch(url,{headers:{Authorization:`Bearer ${t}`}});const d=await r.json();if(!r.ok)throw new Error(d.message);return d;});
 useEffect(()=>{if(book?.design)setDesign(book.design);},[book]);
 async function save(e){e.preventDefault();setSaving(true);setNotice('');try{const r=await fetch(`${API}/books/${id}/design`,{method:'PUT',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({...design,layoutStyle:getBookStyle(design.layoutStyle,book?.language).id})});const d=await r.json();if(!r.ok)throw new Error(d.message);setNotice('Print settings saved.');await mutate();}catch(e){setNotice(e.message);}finally{setSaving(false);}}
 return <div className="ui-workspace"><AuthorSidebar currentStep="content"/>
  <main className="ui-shell">
   <header className="ui-heading"><div><p className="ui-eyebrow">Nobel / Book studio</p><h1 className="">Book studio</h1><p className="mt-3 text-stone-500">{book?.title || 'Your book'} · Manuscript, paper and cover in one place.</p></div><Link href={`/write/tool/step2/${id}/metadata`} className="ui-button">Publication details →</Link></header>
   {error && <p role="alert" className="mb-5 text-red-700">{error.message}</p>}
   <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
    <div className="space-y-5"><section className="ui-card"><div className="flex items-center justify-between"><div><p className="ui-eyebrow">01 / THE OBJECT</p><h2 className="mt-2 text-base font-semibold">Print & paper</h2></div><BookOpen className="text-[#517b6b]"/></div><p className="ui-help">Choose the edition you want readers to hold. Save these settings before checking the print proof.</p>
     <form onSubmit={save} className="mt-6 space-y-8">{PRINT_CHOICES.map(({key,label,help,options})=><fieldset key={key}><legend className="text-sm font-semibold text-slate-900">{label}</legend><p className="ui-help mt-1">{help}</p><div className={`mt-4 grid gap-3 ${key==='size'?'sm:grid-cols-2 xl:grid-cols-3':options.length===3?'sm:grid-cols-3':'sm:grid-cols-2'}`}>{options.map(option=><PrintOptionCard key={option.value} option={option} name={key} selected={design[key]===option.value} onChange={()=>setDesign({...design,[key]:option.value})}/>)}</div></fieldset>)}<div className="flex flex-wrap items-center gap-4 border-t border-stone-100 pt-5"><button disabled={saving||!book} className="ui-button disabled:opacity-50">{saving?'Saving…':'Save print settings'}</button><p role="status" className="text-sm text-stone-600">{notice || (!book?.design?'Your first edition starts here.':'')}</p></div></form>
    </section>
    <section className="ui-card"><p className="ui-eyebrow">02 / The interior</p><h2 className="mt-2">How would you like to prepare your manuscript?</h2><p className="ui-help">Choose the way that fits where you are in your writing. You can import a Word document and continue editing it online.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">
      <Link href={`/write/tool/step2/${id}/canva`} className="workflow-option"><span className="workflow-option-icon">Aa</span><h3>Write in the book editor</h3><p>Best for writing and refining one chapter at a time.</p><ul><li>English and Hindi book styles</li><li>Chapter organisation and formatting</li><li>Automatic page layout in the preview</li></ul><span className="workflow-option-action">Open writing desk <ArrowUpRight size={15}/></span></Link>
      <Link href={`/write/tool/step2/${id}/manuscript`} className="workflow-option"><span className="workflow-option-icon">W</span><h3>Bring your Word manuscript</h3><p>Best when your book is already written in a .docx file.</p><ul><li>Review headings and sections before adding</li><li>Existing chapters are kept</li><li>Check the formatting guide and final proof</li></ul><span className="workflow-option-action">Upload Word manuscript <ArrowUpRight size={15}/></span></Link>
    </div></section>
    <ManuscriptGuide/>
    </div>
    <aside className="space-y-5"><section className="rounded-xl bg-[#19334c] p-5 text-white"><p className="text-[10px] tracking-widest text-slate-300">02 / THE STORY</p><h2 className="mt-3 text-lg font-semibold">Your manuscript</h2><p className="mt-2 text-xs leading-6 text-slate-300">{book?.chapters?.length || 0} sections saved. Write, organise and refine your manuscript.</p><Link href={`/write/tool/step2/${id}/canva`} className="mt-5 flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-xs font-semibold text-[#19334c]">Open manuscript <ArrowUpRight size={18}/></Link><Link href={`/write/tool/step2/${id}/manuscript`} className="mt-3 flex items-center justify-between rounded-lg border border-white/30 px-3 py-2.5 text-xs font-semibold text-white">Upload a Word manuscript <ArrowUpRight size={18}/></Link><p className="mt-3 text-xs leading-5 text-slate-300">Already have a .docx? Upload it and check the sections before adding them.</p><Link href={`/write/tool/step2/${id}/canva/preview`} className="mt-2 block py-2 text-center text-xs text-white/80">Read the complete book preview →</Link></section>
     <section className="ui-card"><p className="ui-eyebrow">03 / FIRST IMPRESSIONS</p><div className="mt-5 flex items-center gap-5"><SignedS3Image coverDesign={book?.coverDesign} s3Key={book?.frontCoverKey} directUrl={book?.frontCoverUrl} accessToken={token} alt="Front cover" className="h-24 w-16 rounded object-cover shadow-md"/><div><h2 className="text-base font-semibold">The cover</h2><p className="ui-help">Design front and back covers with text, images, colours and icons.</p></div></div><Link href={`/write/tool/step2/${id}/cover`} className="ui-button ui-button-secondary mt-5"><ArrowUpRight size={16}/>{book?.coverDesign ? "Edit cover design" : "Design your cover"}</Link></section>
    </aside>
   </div>
  </main>
 </div>;
}
export default function DesignPage(){const params=useParams();const id=Array.isArray(params.bookId)?params.bookId[0]:params.bookId;return <BookEditGuard bookId={id}><Studio id={id}/></BookEditGuard>;}
