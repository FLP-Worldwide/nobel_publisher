"use client";
import { useRef, useState } from 'react';
import { stylesForLanguage, manuscriptStyle, sectionHeadingHtml } from '@/utils/bookLayout';
export default function BookStylePicker({ language, value, onChange, disabled }) {
  const dialog = useRef(null);
  const [pending, setPending] = useState(false);
  const options = stylesForLanguage(language);
  return <>
    <button type="button" onClick={() => dialog.current.showModal()} disabled={disabled} className="writer-style-button">Layout · {value.name}</button>
    <dialog ref={dialog} className="m-auto w-[min(880px,94vw)] max-h-[90vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xl backdrop:bg-slate-950/50">
      <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">Choose your book style</h2><p className="mt-1 text-sm text-slate-600">One consistent design for your entire manuscript. Your words stay the same.</p></div><button type="button" aria-label="Close book styles" onClick={() => dialog.current.close()} className="rounded p-2 hover:bg-slate-200">✕</button></div>
      <div className={`grid gap-4 sm:grid-cols-2 ${options.length === 3 ? "lg:grid-cols-3" : ""}`}>
        {options.map(style => <button type="button" key={style.id} disabled={pending} className="book-style-option disabled:opacity-50" aria-pressed={value.id === style.id} onClick={async () => { setPending(true); try { if (await onChange(style.id)) dialog.current.close(); } finally { setPending(false); } }}>
          <div className="book-typeset h-52 overflow-hidden border border-slate-200 bg-white p-5" style={{ ...manuscriptStyle(style), fontSize: '10px' }}>
            <div dangerouslySetInnerHTML={{ __html: sectionHeadingHtml({ title: style.language === 'hi' ? 'एक नई शुरुआत' : 'A new beginning', type: 'chapter', number: 1 }, style) }} />
            <p>{style.language === 'hi' ? 'हर कहानी एक नए सफ़र की शुरुआत होती है। शब्दों में छिपी यादें पाठक के मन में एक नई दुनिया रचती हैं।' : 'Every story starts somewhere. A familiar voice, a quiet moment, a world waiting to be discovered.'}</p>
            <div className="mt-3 space-y-1.5" aria-hidden="true">{[1,2,3,4].map(n=><div key={n} className="h-px bg-slate-200" />)}</div>
          </div>
          <span className="mt-4 block text-sm font-semibold">{style.name} {value.id === style.id ? '✓' : ''}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{style.description} · {style.points} pt</span>
        </button>)}
      </div>
      <p className="mt-4 text-xs text-slate-500" role="status">{pending ? 'Saving the book style…' : 'The print page size and margins come from Book studio. Open Book Preview to see your page layout.'}</p>
    </dialog>
  </>;
}
