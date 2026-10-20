"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canonicalBookLocation } from '@/utils/bookReference.mjs';
export default function useCanonicalBookUrl(current,publicId) {
 const router=useRouter();
 useEffect(()=>{const next=canonicalBookLocation(window.location.pathname,window.location.search,current,publicId);if(next)router.replace(next+window.location.hash);},[current,publicId,router]);
}
