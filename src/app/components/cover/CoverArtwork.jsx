"use client";
import { useEffect, useId, useState } from 'react';
import { coverFont, COVER_ICONS, loadCoverFonts, textLines } from '@/utils/coverCanvas';

export function CoverText({element:e}) {
  const [lines,setLines]=useState([]);const id=useId().replaceAll(':','');
  useEffect(()=>{let active=true;loadCoverFonts([e]).catch(()=>{}).then(()=>{if(active)setLines(textLines(e));});return()=>{active=false;};},[e.text,e.font,e.fontSize,e.bold,e.italic,e.w]); // eslint-disable-line react-hooks/exhaustive-deps
  return <><defs><clipPath id={id}><rect width={e.w} height={e.h}/></clipPath></defs><text clipPath={`url(#${id})`} fill={e.color} fontFamily={coverFont(e.font)} fontSize={e.fontSize} fontWeight={e.bold?700:400} fontStyle={e.italic?'italic':'normal'} textAnchor={e.align==='center'?'middle':e.align==='right'?'end':'start'}>{lines.map((line,i)=><tspan key={i} x={e.align==='center'?e.w/2:e.align==='right'?e.w:0} y={e.fontSize+i*e.fontSize*1.3}>{line}</tspan>)}</text></>;
}
export function CoverLayer({element:e}) {
  if(e.type==='text')return <CoverText element={e}/>;
  if(e.type==='image')return <image href={e.src} width={e.w} height={e.h} preserveAspectRatio="xMidYMid slice"/>;
  if(e.type==='icon')return <svg width={e.w} height={e.h} viewBox="0 0 24 24" fill="none" stroke={e.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={COVER_ICONS[e.icon]}/></svg>;
  return e.shape==='ellipse'?<ellipse cx={e.w/2} cy={e.h/2} rx={e.w/2} ry={e.h/2} fill={e.color}/>:<rect width={e.w} height={e.h} fill={e.color}/>;
}
export default function CoverArtwork({design,side='front',className='',alt='Book cover'}) {
  if(!design?.[side])return null;
  return <svg role="img" aria-label={alt} className={className} viewBox={`0 0 ${design.width} ${design.height}`} xmlns="http://www.w3.org/2000/svg"><rect width={design.width} height={design.height} fill={design[side].background}/>{design[side].elements.map(e=><g key={e.id} opacity={e.opacity} transform={`translate(${e.x} ${e.y}) rotate(${e.rotation} ${e.w/2} ${e.h/2})`}><CoverLayer element={e}/></g>)}</svg>;
}
