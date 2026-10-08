"use client";
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import BookEditGuard from '@/app/components/dashbaord/BookEditGuard';
import CoverDesigner from '@/app/components/cover/CoverDesigner';
const API=(process.env.NEXT_PUBLIC_API_URL||'').replace(/\/$/,'');
function CoverPage({id}){
  const {data:session}=useSession();const token=session?.user?.accessToken;
  const {data:book,error}=useSWR(token?[`${API}/books/${id}`,token]:null,async([url,t])=>{const res=await fetch(url,{headers:{Authorization:`Bearer ${t}`}});const data=await res.json();if(!res.ok)throw Error(data.message||'Unable to load the cover.');return data;},{revalidateOnFocus:false});
  if(error)return <main className="ui-shell"><p role="alert">{error.message}</p></main>;
  if(!book)return <main className="ui-shell" role="status">Opening your cover…</main>;
  return <CoverDesigner key={id} book={book} token={token}/>;
}
export default function Page(){const params=useParams();const id=Array.isArray(params.bookId)?params.bookId[0]:params.bookId;return <BookEditGuard bookId={id}><CoverPage id={id}/></BookEditGuard>;}
