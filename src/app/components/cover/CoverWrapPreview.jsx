"use client";
import CoverArtwork from './CoverArtwork';
import { printWrapSize } from '@/utils/coverPrint.mjs';
export default function CoverWrapPreview({ design, trim, spineWidthMm }) {
  const size = printWrapSize(trim,spineWidthMm);
  const d = 96;
  return <div><svg role="img" aria-label="Full cover wrap preview: back, spine, front" viewBox={`0 0 ${size.widthIn*d} ${size.heightIn*d}`} className="mt-4 w-full border border-slate-300 shadow-sm">
    <rect width={size.widthIn*d} height={size.heightIn*d} fill={design.front.background}/>
    <rect width={size.spineX*d} height={size.heightIn*d} fill={design.back.background}/>
    <svg x={size.backX*d} y={size.bleedIn*d} width={trim.width*d} height={trim.height*d}><CoverArtwork design={design} side="back" className="h-full w-full"/></svg>
    <svg x={size.frontX*d} y={size.bleedIn*d} width={trim.width*d} height={trim.height*d}><CoverArtwork design={design} side="front" className="h-full w-full"/></svg>
    <rect x={size.spineX*d} y={size.bleedIn*d} width={size.spineIn*d} height={trim.height*d} fill="none" stroke="#ebc1cf" strokeWidth=".7" strokeDasharray="3 2"/>
  </svg><p className="mt-2 text-xs leading-5 text-slate-500">Back · spine · front · {size.widthIn.toFixed(3)} × {size.heightIn.toFixed(3)} in including bleed</p></div>;
}
