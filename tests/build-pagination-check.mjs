import { readFileSync, writeFileSync } from 'node:fs';
const pagination = readFileSync('src/utils/pagination.js','utf8').replaceAll('export ', '');
const layout = readFileSync('src/utils/bookLayout.js','utf8').replaceAll('export ', '');
const css = readFileSync('src/app/globals.css','utf8');
const typeset = css.slice(css.indexOf("@font-face { font-family: 'Nobel Hindi"));
const checks = `
const results = [];
const assert = (ok, name, details) => { results.push({name,passed:!!ok,details}); if(!ok) throw new Error(name+' '+JSON.stringify(details)); };
const text = html => { const el=document.createElement('div'); el.innerHTML=html; return el.textContent.replace(/\\s+/g,' ').trim(); };
const prose = 'Every book held a memory, every margin a note from a reader who had come before. We followed the path beyond the courtyard and into a new world. ';
const hindi = 'हर कहानी एक नए सफ़र की शुरुआत होती है। शब्दों में छिपी यादें पाठक के मन में एक नई दुनिया रचती हैं। ';
try {
await document.fonts.ready;
for(const style of BOOK_STYLES) {
 await ensureBookFonts(style);
 for(const size of ['FIVE_X_EIGHT','SIX_X_NINE']) {
  const trim=getTrimSize(size), width=trim.width*96, height=trim.height*96;
  const section={title:style.language==='hi'?'एक नई शुरुआत':'A new beginning',type:'chapter',number:1};
  const heading=measureHeading(section,style,width-96);
  const body=Array.from({length:9},(_,i)=>'<p>'+i+' <strong>'+ (style.language==='hi'?hindi:prose).repeat(4)+'</strong> <em>Ending.</em></p>').join('');
  const pages=paginateByHeight(body,width,height,{firstPageHeading:heading,typography:manuscriptStyle(style)});
  assert(text(pages.join(''))===text(body),'All words retained '+style.id+' '+size,{pages:pages.length});
  const box=document.createElement('div'); box.className='manuscript-prose book-typeset'; Object.assign(box.style,manuscriptStyle(style),{width:(width-96)+'px',display:'flow-root'}); document.body.append(box);
  const used=pages.map(html=>{box.innerHTML=html;return box.getBoundingClientRect().height;});box.remove();
  assert(used.every((h,i)=>h<=(height-96-(i?0:heading))+.6),'No clipped text '+style.id+' '+size,used);
  assert(used.slice(0,-1).every((h,i)=>(height-96-(i?0:heading))-h<60),'Pages fill remaining space '+style.id+' '+size,used);
  assert(pages.every(html=>html.includes('<strong>')),'Bold survives splits '+style.id+' '+size);
 }
}
for(const html of ['<p>First<br>Second<br><br>Third</p>','<p>First</p><div data-page-break="true"></div><p>Second</p>','<p>First<span data-page-break="true"></span>Second</p>','<p>First<br style="page-break-before:always">Second</p>']) {
 const pages=paginateByHeight(html,480,768);
 assert(text(pages.join(''))===text(html),'Line/break text preserved',{html,pages});
 assert(pages.length===(html.includes('page-break')?2:1),'Only explicit breaks start pages',{html,pages});
}
const multi='<p><strong>First<br style="break-before:page">Second<br style="break-before:page">Third</strong></p>';
const multiPages=paginateByHeight(multi,480,768);
assert(multiPages.length===3 && text(multiPages.join(''))===text(multi),'Multiple nested manual breaks preserved',multiPages);
const after='<p><strong style="break-after:page">First</strong>Second</p>';
const afterPages=paginateByHeight(after,480,768);
assert(afterPages.length===2 && text(afterPages.join(''))===text(after),'Nested break-after preserved',afterPages);
const longWord='<p>' +('कहानी').repeat(900)+'</p>';
assert(text(paginateByHeight(longWord,480,768).join(''))===text(longWord),'Long Hindi token preserved');
const formatted='<p><strong>Bold</strong> <em>Italic</em> <u>Underline</u> <s>Strike</s></p>';
assert(paginateByHeight(formatted,480,768)[0]===formatted,'Inline formatting retained');
} catch(error) { results.push({passed:false,error:error.message}); }
document.getElementById('results').textContent=JSON.stringify({passed:results.every(x=>x.passed),checks:results},null,2);
`;
writeFileSync('public/canvas-regression.html',`<!doctype html><html><meta charset="UTF-8"><title>Pagination checks</title><style>*{box-sizing:border-box}body{margin:20px}p,h2{margin:0}header{display:block}${typeset}</style><h1>Pagination regression</h1><pre id="results">Running…</pre><script type="module">${layout}\n${pagination}\n${checks}</script></html>`);
console.log('Generated temporary browser fixture: public/canvas-regression.html');
