"use client";
import SignedS3Image from '@/app/components/SignedS3Image';
export default function BookCoverPreview({ book, side, accessToken, width = 300 }) {
  const raw = book?._raw || book || {};
  const available = Boolean(raw.coverDesign?.[side] || raw[`${side}CoverKey`] || raw[`${side}CoverUrl`]);
  return <figure id={`preview-${side}-cover`} className="book-preview-controls mx-auto my-6 scroll-mt-28" style={{ maxWidth: width }}>
    {available ? <SignedS3Image coverDesign={raw.coverDesign} side={side} s3Key={raw[`${side}CoverKey`]} directUrl={raw[`${side}CoverUrl`]} accessToken={accessToken} alt={`${side === 'front' ? 'Front' : 'Back'} cover of ${book.title || 'your book'}`} className="block h-auto w-full border border-slate-200 bg-white shadow-xl"/> : <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">No {side} cover saved yet. Add it in the cover designer.</div>}
    <figcaption className="mt-3 text-center text-xs font-semibold text-slate-600">{side === 'front' ? 'Front cover · outside of book' : 'Back cover · outside of book'}</figcaption>
  </figure>;
}
