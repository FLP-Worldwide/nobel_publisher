"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowUpRight, BookOpen, ImagePlus, Check } from 'lucide-react';
import AuthorSidebar from '@/app/components/dashbaord/AuthorSidebar';
import BookEditGuard from '@/app/components/dashbaord/BookEditGuard';
import CoverUploadModal from '@/app/components/CoverUploadModal';
import SignedS3Image from '@/app/components/SignedS3Image';
const API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
const choices = [
 ['size','Page size',[['FIVE_X_EIGHT','5 × 8 in'],['FIVE_HALF_X_EIGHT_HALF','5.5 × 8.5 in'],['SIX_X_NINE','6 × 9 in'],['EIGHT_HALF_X_EIGHT_HALF','8.5 × 8.5 in'],['EIGHT_HALF_X_ELEVEN','8.5 × 11 in']]],
 ['bindingType','Binding',[['PAPERBACK','Paperback'],['HARDCOVER','Hardcover']]],
 ['interior','Ink',[['BLACK_WHITE','Black & white'],['COLOR','Full colour']]],
 ['paperType','Paper',[['CREAM','Warm cream'],['WHITE','White'],['ART_MATTE','Matte art paper']]],
 ['coverLamination','Cover finish',[['MATTE','Soft matte'],['GLOSS','Gloss']]],
];
function Studio({id}) {
 const {data:session}=useSession(); const token=session?.user?.accessToken;
 const [design,setDesign]=useState({size:'FIVE_X_EIGHT',bindingType:'PAPERBACK',interior:'BLACK_WHITE',paperType:'CREAM',coverLamination:'MATTE'});
 const [notice,setNotice]=useState(''); const [saving,setSaving]=useState(false); const [cover,setCover]=useState(false);
 const {data:book,error,mutate}=useSWR(token?[`${API}/books/${id}`,token]:null,async([url,t])=>{const r=await fetch(url,{headers:{Authorization:`Bearer ${t}`}});const d=await r.json();if(!r.ok)throw new Error(d.message);return d;});
 useEffect(()=>{if(book?.design)setDesign(book.design);},[book]);
 async function save(e){e.preventDefault();setSaving(true);setNotice('');try{const r=await fetch(`${API}/books/${id}/design`,{method:'PUT',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(design)});const d=await r.json();if(!r.ok)throw new Error(d.message);setNotice('Print settings saved.');await mutate();}catch(e){setNotice(e.message);}finally{setSaving(false);}}
 return <div className="min-h-screen bg-[#f5f3ee] text-stone-900"><AuthorSidebar currentStep="content"/>
  <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
   <header className="mb-9 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#517b6b]">Nobel / Book studio</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">Give your story its shape.</h1><p className="mt-3 text-stone-500">{book?.title || 'Your book'} · Manuscript, paper and cover in one place.</p></div><Link href={`/write/tool/step2/${id}/metadata`} className="rounded-xl bg-[#244d43] px-5 py-3 text-sm font-semibold text-white">Publication details →</Link></header>
   {error && <p role="alert" className="mb-5 text-red-700">{error.message}</p>}
   <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
    <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs tracking-widest text-stone-400">01 / THE OBJECT</p><h2 className="mt-2 text-xl font-semibold">Print & paper</h2></div><BookOpen className="text-[#517b6b]"/></div><p className="mt-3 text-sm leading-6 text-stone-500">Choose the edition you want readers to hold. Save these settings before checking the print proof.</p>
     <form onSubmit={save} className="mt-6 space-y-6">{choices.map(([key,label,options])=><fieldset key={key}><legend className="mb-3 text-sm font-semibold">{label}</legend><div className="flex flex-wrap gap-2">{options.map(([value,text])=><label key={value} className={`cursor-pointer rounded-lg border px-4 py-3 text-sm ${design[key]===value?'border-[#244d43] bg-[#edf3ee] text-[#244d43]':'border-stone-200 text-stone-500'}`}><input className="sr-only" type="radio" name={key} value={value} checked={design[key]===value} onChange={()=>setDesign({...design,[key]:value})}/>{text}{design[key]===value && <Check size={13} className="ml-2 inline"/>}</label>)}</div></fieldset>)}<div className="flex flex-wrap items-center gap-4 border-t border-stone-100 pt-5"><button disabled={saving||!book} className="rounded-xl bg-[#244d43] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving?'Saving…':'Save print settings'}</button><p role="status" className="text-sm text-stone-600">{notice || (!book?.design?'Your first edition starts here.':'')}</p></div></form>
    </section>
    <aside className="space-y-5"><section className="rounded-3xl bg-[#244d43] p-7 text-white"><p className="text-xs tracking-widest text-emerald-200">02 / THE STORY</p><h2 className="mt-4 font-serif text-3xl">A place for your words.</h2><p className="mt-3 text-sm leading-6 text-white/70">{book?.chapters?.length || 0} sections saved. Write, organise and refine your manuscript.</p><Link href={`/write/tool/step2/${id}/canva`} className="mt-6 flex items-center justify-between rounded-xl bg-white px-4 py-3 font-semibold text-[#244d43]">Open manuscript <ArrowUpRight size={18}/></Link><Link href={`/write/tool/step2/${id}/canva/preview`} className="mt-3 block py-2 text-center text-sm text-white/80">Read the facing-page proof →</Link></section>
     <section className="rounded-3xl border border-stone-200 bg-[#ece5d8] p-7"><p className="text-xs tracking-widest text-stone-500">03 / FIRST IMPRESSIONS</p><div className="mt-5 flex items-center gap-5"><SignedS3Image s3Key={book?.frontCoverKey} directUrl={book?.frontCoverUrl} accessToken={token} alt="Front cover" className="h-32 w-20 rounded object-cover shadow-md"/><div><h2 className="font-serif text-2xl">The cover</h2><p className="mt-2 text-sm text-stone-600">Upload your front and back artwork.</p></div></div><button onClick={()=>setCover(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold"><ImagePlus size={16}/>Manage artwork</button></section>
    </aside>
   </div>
  </main><CoverUploadModal open={cover} onClose={()=>{setCover(false);mutate();}} bookId={id} accessToken={token} API_BASE={API}/>
 </div>;
}
export default function DesignPage(){const params=useParams();const id=Array.isArray(params.bookId)?params.bookId[0]:params.bookId;return <BookEditGuard bookId={id}><Studio id={id}/></BookEditGuard>;}
