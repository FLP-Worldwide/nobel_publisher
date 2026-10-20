"use client";
import useCanonicalBookUrl from "@/hooks/useCanonicalBookUrl";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
const API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
export default function BookEditGuard({ bookId, children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const token = session?.user?.accessToken;
  const { data, error: loadError, mutate } = useSWR(bookId && token ? [`${API}/books/${bookId}`, token] : null, async ([url, access]) => {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${access}` } });
    const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to open book'); return result;
  }, { refreshInterval: 10000 });
  useCanonicalBookUrl(bookId,data?.publicId);
  if (!bookId) return children;
  if (loadError) return <div role="alert" className="p-10 text-red-800">{loadError.message}</div>;
  if (status === 'unauthenticated') return <Link href="/login" className="block p-10">Sign in to open your book</Link>;
  if (!data) return <div className="p-10 text-stone-500">Opening your book…</div>;
  if (['DRAFT','CHANGES_REQUESTED'].includes(data.status)) return children;
  async function revise() {
    setBusy(true); setError('');
    try { const response = await fetch(`${API}/books/${bookId}/revise`, { method:'POST',headers:{Authorization:`Bearer ${token}`} }); const result=await response.json(); if(!response.ok) throw new Error(result.message); await mutate(); router.refresh(); }
    catch(e){setError(e.message);} finally {setBusy(false);}
  }
  return <main className="mx-auto max-w-2xl px-6 py-16"><LockKeyhole className="text-[#244d43]" size={36}/><p className="mt-6 text-xs font-bold uppercase tracking-widest text-stone-500">{data.status.replaceAll('_',' ')}</p><h1 className="mt-3 font-serif text-4xl">This edition is protected.</h1><p className="mt-5 leading-7 text-stone-600">{['IN_REVIEW', 'PAYMENT_PENDING'].includes(data.status) ? 'Your manuscript, cover and book details are locked until the reviewer records a decision. You can still read the complete preview.' : 'Start a revision to make changes. The revised book must pass review again. A review fee already paid for this book will carry forward.'}</p>
    <div className="mt-7 flex flex-wrap gap-3"><Link href={`/write/tool/step2/${bookId}/canva/preview`} className="rounded-xl bg-[#244d43] px-5 py-3 text-white">Read preview</Link><Link href={`/write/tool/step2/${bookId}/pricing_info`} className="rounded-xl border px-5 py-3">Review status</Link></div>
    {['APPROVED','PUBLISHED','REJECTED'].includes(data.status) && <div className="mt-8 border-t pt-6"><p className="mb-4 text-sm text-stone-500">Starting a revision pauses the public listing until the new version is approved and published.</p><button disabled={busy} onClick={revise} className="rounded-xl border border-stone-400 px-5 py-3 font-semibold">{busy ? 'Opening revision…' : 'Start a new revision'}</button></div>}
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
  </main>;
}
