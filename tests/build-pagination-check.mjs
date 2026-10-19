import { readFileSync, writeFileSync } from 'node:fs';
const pagination = readFileSync('src/utils/pagination.js','utf8').replaceAll('export ', '');
const sanitizer = readFileSync('src/app/components/editor/sanitizeHtml.js','utf8').replaceAll('export ', '');
const paste = readFileSync('src/app/components/editor/manuscriptPaste.js','utf8').replace(/^import .*;\n/m, '').replaceAll('export ', '');
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
const mixed='<p>'+Array.from({length:150},()=>'<strong>क</strong><em>ि</em><span>ता</span><u>ब</u><span>ें</span>').join('')+'</p>';
const mixedPages=paginateByHeight(mixed,180,160,{margin:12,typography:manuscriptStyle(getBookStyle('hindi-saral','Hindi'))});
const fullText=text(mixed);
const validEnds=new Set([...new Intl.Segmenter('hi',{granularity:'grapheme'}).segment(fullText)].map(part=>part.index+part.segment.length));
let consumed=0;
assert(mixedPages.length>1,'Formatted Hindi fixture spans several pages');
for(const fragment of mixedPages) { consumed+=text(fragment).length; assert(validEnds.has(consumed),'Page boundary keeps formatted Hindi syllable together',{consumed}); }
assert(text(mixedPages.join(''))===fullText,'Formatted Hindi code points retained across pages');
const original='उसका नाम रुद्र वर्मा था।\\nएक टूटी कुर्सी, एक टेबल और किताबें। क्ष त्र ज्ञ श्र क्‍ष क्‌ष';
const pasted=prepareManuscriptPaste({text:original,html:'<p><span style="font-family:Legacy Hindi">broken source markup</span></p>'});
const pasteNode=document.createElement('div');pasteNode.innerHTML=pasted;pasteNode.querySelectorAll('br').forEach(node=>node.replaceWith('\\n'));
assert(pasteNode.textContent===original,'Hindi auto paste uses original Unicode plain text');
assert(!pasted.includes('span')&&!pasted.includes('font-family'),'Hindi auto paste drops foreign font spans');
assert(pasted.includes('क्‍ष')&&pasted.includes('क्‌ष'),'Intentional Hindi joiners survive paste');
const richOnly=sanitizeManuscriptHtml('<p><span style="font-family:Legacy">क</span><span>ि</span><span>ताबें</span></p>');
assert(richOnly==='<p>किताबें</p>','Unstyled source spans collapse into one Hindi shaping run',richOnly);
assert(prepareManuscriptPaste({text:'किताबें',html:'<p><strong>किताबें</strong></p>',mode:'rich'}).includes('<strong>'),'Explicit rich Hindi paste preserves bold');
assert(prepareManuscriptPaste({text:'English',html:'<p><strong>English</strong></p>'}).includes('<strong>'),'English auto paste preserves formatting');
assert(!prepareManuscriptPaste({text:'<img onerror=alert(1)> हिंदी'}).includes('<img'),'Plain paste treats markup as text');
assert(!hasDetachedDevanagariMarks(original),'Valid Hindi has no orphan-mark warning');
assert(hasDetachedDevanagariMarks('एक िकताब')&&hasDetachedDevanagariMarks('क ◌ि')&&hasDetachedDevanagariMarks('�'),'Already-corrupt source gets a warning');
for(const lang of ['Hindi','हिन्दी','हिंदी','hi','hi-IN','hi_IN']) assert(getBookStyle(null,lang).language==='hi','Hindi language recognised '+lang);
for(const family of ['Nobel Hindi Serif','Nobel Hindi Sans']) assert(document.fonts.check('16px "'+family+'"','किताबें कुर्सी क्षत्रिय'),'Bundled Hindi font loads '+family);
const formatted='<p><strong>Bold</strong> <em>Italic</em> <u>Underline</u> <s>Strike</s></p>';
assert(paginateByHeight(formatted,480,768)[0]===formatted,'Inline formatting retained');
} catch(error) { results.push({passed:false,error:error.message}); }
document.getElementById('results').textContent=JSON.stringify({passed:results.every(x=>x.passed),checks:results},null,2);
`;
writeFileSync('public/canvas-regression.html',`<!doctype html><html><meta charset="UTF-8"><title>Pagination checks</title><style>*{box-sizing:border-box}body{margin:20px}p,h2{margin:0}header{display:block}${typeset}</style><h1>Pagination regression</h1><pre id="results">Running…</pre><script type="module">${layout}\n${pagination}\n${sanitizer}\n${paste}\n${checks}</script></html>`);
console.log('Generated temporary browser fixture: public/canvas-regression.html');
