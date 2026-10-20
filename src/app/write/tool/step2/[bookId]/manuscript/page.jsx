"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileUp, Loader2, CheckCircle2 } from 'lucide-react';
import AuthorSidebar from '@/app/components/dashbaord/AuthorSidebar';
import BookEditGuard from '@/app/components/dashbaord/BookEditGuard';
import ManuscriptGuide from '@/app/components/editor/ManuscriptGuide';
import { getBookStyle, manuscriptStyle } from '@/utils/bookLayout';
const API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

function ManuscriptUpload({ id }) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [book,setBook] = useState(null), [parsed,setParsed] = useState(null), [notice,setNotice] = useState(null);
  const [reading,setReading] = useState(false), [saving,setSaving] = useState(false), [accepted,setAccepted] = useState(false), [done,setDone] = useState(false), [uncertain,setUncertain] = useState(false);
  const attempt = useRef(null), busy = useRef(false);
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  async function refreshBook() {
    const response = await fetch(`${API}/books/${id}`, { headers, cache: 'no-store' });
    if (!response.ok) throw Error('Your book details couldn’t be loaded. Reopen this book from the dashboard.');
    const result = await response.json(); setBook(result); return result;
  }
  useEffect(() => { if (token) refreshBook().catch(error=>setNotice({ title:'Book details aren’t ready', text:error.message })); }, [token,id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const leave = event => { if (parsed && !done) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload',leave); return()=>window.removeEventListener('beforeunload',leave);
  }, [parsed,done]);
  async function chooseFile(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || busy.current || uncertain) return;
    busy.current = true; setReading(true); setParsed(null); setNotice(null); setAccepted(false); setDone(false); attempt.current = null;
    try { const { parseWordManuscript } = await import('@/utils/manuscriptImport'); setParsed(await parseWordManuscript(file)); }
    catch (error) { setNotice({ title:'This document needs a quick check', text:error.message || 'Save a fresh .docx copy and try again.' }); }
    finally { busy.current=false; setReading(false); }
  }
  async function saveImport() {
    if (busy.current || !book || !accepted) return;
    const sections = parsed.sections.filter(section=>section.include).map(({title,type,content})=>({title,type,content}));
    if (!sections.length) { setNotice({title:'Choose a section to import',text:'Select at least one chapter or section below.'}); return; }
    if (!attempt.current) attempt.current = { importKey: crypto.randomUUID(), expectedUpdatedAt: book.updatedAt, sections };
    busy.current = true; setSaving(true); setNotice(null);
    try {
      const response = await fetch(`${API}/books/${id}/manuscript-import`, { method:'POST', headers, body:JSON.stringify(attempt.current) });
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw Object.assign(Error(data.message || 'We couldn’t confirm the import. Keep this page open and try again.'),{status:response.status,code:data.code});
      setDone(true); setUncertain(false); setBook(current=>({...current,updatedAt:data.updatedAt}));
      setNotice({ success:true,title:`${data.importedCount} ${data.importedCount===1?'section is':'sections are'} ready in your writing desk`,text:'Your existing chapters have been kept. Open the manuscript to edit, then check the complete book preview.' });
      attempt.current=null;
    } catch (error) {
      const retry = !error.status || error.status>=500;
      setUncertain(retry);
      setNotice({ title:retry?'Let’s check your manuscript import':'The import needs your attention', text:error.status>=500 || !error.status?'Your existing writing is safe. Try again to check this same upload; it will not add the sections twice.':error.message,
        retry, refresh:error.code==='BOOK_CHANGED' });
      if (!retry && error.code!=='BOOK_CHANGED') attempt.current=null;
    } finally { busy.current=false; setSaving(false); }
  }
  async function refreshForRetry() {
    try { const fresh = await refreshBook(); if (attempt.current) attempt.current.expectedUpdatedAt=fresh.updatedAt; setNotice({title:'Book details refreshed',text:'Your selected sections are still here. Check them, then import when you’re ready.'}); attempt.current=null; }
    catch (error) { setNotice({ title:'We couldn’t refresh the book yet',text:error.message,refresh:true }); }
  }
  const selected = parsed?.sections.filter(section=>section.include).length || 0;
  const style = getBookStyle(book?.design?.layoutStyle,book?.language);
  return <div className="ui-workspace"><AuthorSidebar currentStep="content"/><main className="ui-shell">
    <header className="ui-heading"><div><p className="ui-eyebrow">02 / Bring your manuscript</p><h1>Upload your Word manuscript</h1><p>Already written your book? Import it, check each section and continue in the writing desk.</p></div><Link href={`/write/tool/step2/${id}`} className="ui-button ui-button-secondary"><ArrowLeft size={15}/>Book studio</Link></header>
    {notice && <div role={notice.success?'status':'alert'} className={`mb-5 rounded-xl border p-4 text-sm ${notice.success?'border-emerald-200 bg-emerald-50 text-emerald-950':'border-amber-200 bg-amber-50 text-amber-950'}`}><p className="font-semibold">{notice.title}</p><p className="mt-1 leading-6">{notice.text}</p>{notice.retry&&<button onClick={saveImport} disabled={saving} className="ui-button mt-3">{saving?'Checking import…':'Try again'}</button>}{notice.refresh&&<button onClick={refreshForRetry} className="ui-button ui-button-secondary mt-3">Refresh book details</button>}</div>}
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-5">
      <section className="ui-card"><div className="flex items-start gap-4"><FileUp className="mt-1 shrink-0 text-[#527e70]" size={28}/><div><h2>Start with your .docx file</h2><p className="ui-help">Text, chapter headings, lists, notes, pictures and tables can be imported. Word’s page layout is rebuilt for your book; check it before submitting.</p></div></div>
        <label className="mt-5 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-[#bfd0c7] bg-[#f4f8f5] px-5 py-8 text-center"><span className="text-sm font-semibold text-[#244d40]">{reading?'Reading your manuscript…':done?'Choose another Word document':'Choose a Word document'}</span><span className="mt-2 text-xs text-slate-500">.docx · up to 10 MB · up to 3 MB after import</span><input aria-label="Upload Word manuscript" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={!book||reading||saving||uncertain} onChange={chooseFile} className="mt-4 max-w-full text-xs"/></label>
        {reading&&<p role="status" className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Loader2 size={15} className="animate-spin"/>Reading headings and checking the document…</p>}
        <p className="ui-help mt-4">Imports are added after your existing chapters. Nothing is replaced or submitted for review by uploading.</p>
      </section>
      {parsed&&<section className="ui-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="ui-eyebrow">Check before adding</p><h2 className="mt-2 break-all">{parsed.filename}</h2></div><span className="text-xs font-semibold text-[#527e70]">{selected} of {parsed.sections.length} sections selected</span></div>
        <ul className="mt-4 list-disc space-y-2 rounded-lg bg-amber-50 p-4 pl-8 text-xs leading-6 text-amber-950">{parsed.warnings.map(warning=><li key={warning}>{warning}</li>)}</ul>
        <fieldset disabled={saving||done||uncertain} className="mt-5 space-y-3 disabled:opacity-75">{parsed.sections.map((section,index)=><details key={section.id} className="rounded-lg border border-slate-200 p-3"><summary className="cursor-pointer text-sm font-semibold">{section.title}<span className="ml-2 text-xs font-normal text-slate-400">{section.include?'Selected':'Not selected'}</span></summary><div className="mt-3"><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={section.include} disabled={/^(title page|contents|table of contents)$/i.test(section.title)} onChange={e=>{attempt.current=null;setParsed(current=>({...current,sections:current.sections.map((item,i)=>i===index?{...item,include:e.target.checked}:item)}));}}/>Add this section</label>{section.explanation&&<p className="ui-help mt-2">{section.explanation}</p>}<label className="ui-label mt-3 block">Section title<input value={section.title} maxLength={200} onChange={e=>{attempt.current=null;setParsed(current=>({...current,sections:current.sections.map((item,i)=>i===index?{...item,title:e.target.value}:item)}));}} className="ui-field mt-1"/></label><div className="manuscript-prose book-typeset mt-4 max-h-80 overflow-auto rounded-lg border bg-slate-50 p-4" style={manuscriptStyle(style)} dangerouslySetInnerHTML={{__html:section.content}}/></div></details>)}</fieldset>
        {!done&&<><label className="mt-5 flex items-start gap-3 text-xs leading-6"><input type="checkbox" checked={accepted} disabled={saving||uncertain} onChange={e=>setAccepted(e.target.checked)} className="mt-1.5"/>I have checked the selected sections and will review the complete book proof before submitting.</label><button onClick={saveImport} disabled={!accepted||!selected||saving||reading} className="ui-button mt-4"><FileUp size={15}/>{saving?'Adding your sections…':uncertain?'Check this import':`Add ${selected} selected sections`}</button></>}
        {done&&<div className="mt-5 flex flex-wrap gap-3"><Link href={`/write/tool/step2/${id}/canva`} className="ui-button"><BookOpen size={15}/>Open writing desk</Link><Link href={`/write/tool/step2/${id}/canva/preview`} className="ui-button ui-button-secondary">Check complete book preview</Link></div>}
      </section>}
    </div><aside className="space-y-5"><ManuscriptGuide/><section className="ui-card"><CheckCircle2 className="text-[#527e70]"/><h2 className="mt-3">Prefer to write online?</h2><p className="ui-help">Write one chapter at a time and let the book preview handle page layout.</p><Link href={`/write/tool/step2/${id}/canva`} className="ui-button ui-button-secondary mt-4">Open writing desk</Link></section></aside></div>
  </main></div>;
}
export default function ManuscriptPage() { const params=useParams();const id=Array.isArray(params.bookId)?params.bookId[0]:params.bookId;return <BookEditGuard bookId={id}><ManuscriptUpload id={id}/></BookEditGuard>; }
