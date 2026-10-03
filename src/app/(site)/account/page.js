"use client";
import {useSession,signOut} from 'next-auth/react';
import useSWR from 'swr';
import Link from 'next/link';
export default function ReaderAccount(){
 const {data:session}=useSession();const token=session?.user?.accessToken;
 const {data,error}=useSWR(token?[`${process.env.NEXT_PUBLIC_API_URL}/orders/my`,token]:null,async([url,t])=>{const r=await fetch(url,{headers:{Authorization:`Bearer ${t}`}});const d=await r.json();if(!r.ok)throw new Error(d.message);return d;});
 const orders=Array.isArray(data)?data:data?.orders||[];
 return <main className="ui-shell"><p className="text-xs uppercase tracking-widest text-stone-500">Nobel / Reader account</p><h1 className="mt-3 text-[26px] font-semibold">Good to see you, {session?.user?.name || 'reader'}.</h1><div className="mt-6 flex gap-5"><Link className="rounded-xl bg-[#244d43] px-5 py-3 text-white" href="/bookstore">Explore the bookshop</Link><button onClick={()=>signOut({callbackUrl:'/buyer/login'})}>Sign out</button></div><h2 className="mt-12 text-xl font-semibold">Your orders</h2>{error?<p role="alert" className="mt-4 text-red-700">{error.message}</p>:!data?<p className="mt-4">Loading orders…</p>:orders.length?orders.map(o=><article key={o.id} className="mt-4 rounded-xl border p-5"><h3>Order #{o.id}</h3><p className="mt-2 text-stone-500">{o.status} · ₹{Number(o.totalPrice || 0).toLocaleString('en-IN')}</p></article>):<p className="mt-4 rounded-2xl bg-stone-100 p-8 text-stone-500">Your orders will appear here after your first purchase.</p>}</main>;
}
