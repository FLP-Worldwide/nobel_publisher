"use client";
export default function ZoomControls({ zoom, setZoom, fitScale = 1, label = 'Canvas zoom' }) {
  const percent = zoom === 'fit' ? Math.round(fitScale * 100) : zoom;
  return <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1" role="group" aria-label={`${label} controls`}>
    <button type="button" aria-label="Zoom out" className="h-7 w-7 rounded hover:bg-slate-100" onClick={() => setZoom(Math.max(25, percent - 10))}>−</button>
    <label className="sr-only" htmlFor={label.replaceAll(' ', '-')}>{label}</label>
    <select id={label.replaceAll(' ', '-')} className="h-7 bg-transparent text-xs" value={zoom} onChange={e => setZoom(e.target.value === 'fit' ? 'fit' : Number(e.target.value))}>
      <option value="fit">Fit width</option>
      {[...new Set([25,50,75,100,125,150,200, ...(zoom !== 'fit' ? [zoom] : [])])].sort((a,b)=>a-b).map(n=><option key={n} value={n}>{n}%</option>)}
    </select>
    <button type="button" aria-label="Zoom in" className="h-7 w-7 rounded hover:bg-slate-100" onClick={() => setZoom(Math.min(200, percent + 10))}>+</button>
  </div>;
}
