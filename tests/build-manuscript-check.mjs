import { readFileSync,writeFileSync,copyFileSync } from 'node:fs';
if(process.argv[2])copyFileSync(process.argv[2],'public/qa-interior-template.docx');
const source=readFileSync('src/utils/manuscriptImport.js','utf8').replace(/^import .*;\n/gm,'').replaceAll('export ','').replace("const { default: mammoth } = await import('mammoth/mammoth.browser');",'const mammoth = window.mammoth;');
const sanitizer=readFileSync('src/app/components/editor/sanitizeHtml.js','utf8').replaceAll('export ','');
copyFileSync('node_modules/fflate/esm/browser.js','public/qa-fflate.mjs');
copyFileSync('node_modules/mammoth/mammoth.browser.js','public/qa-mammoth.js');
// The supplied template is copied only for local QA; this builder deliberately
// does not read or publish arbitrary files from Downloads.
const checks=`
const results=[];const check=(ok,name)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name);};
try {
const response=await fetch('/qa-interior-template.docx');const file=new File([await response.arrayBuffer()],'5x8_Interior_Template.docx');
const data=await parseWordManuscript(file);
check(data.sections.length===14,'Supplied template produces 14 inspectable sections');
check(data.sections.filter(s=>s.include).length===11,'Generated pages start unselected');
check(data.sections.find(s=>s.title==='Prologue/Introduction').type==='intro','Template introduction is front matter');
check(data.sections.filter(s=>/^\\d\\./.test(s.title)).length===5,'All five chapter headings are found');
check(data.warnings.some(w=>w.includes('Template instructions')),'Placeholder and external platform credits are reported');
check(!data.warnings.some(w=>w.includes('source margins')),'Supplied template matches the measured margins');
const p=splitConvertedManuscript('<h1>अध्याय 1</h1><p><strong>किताबें</strong> और क्‍ष क्‌ष</p><h2>उपशीर्षक</h2><p>अंतिम शब्द</p><h1>अध्याय 2</h1><p>दूसरा अध्याय</p>');
check(p.length===2&&p[0].content.includes('<h2>उपशीर्षक</h2>'),'Subheadings stay within the chapter');
check(p[0].content.includes('क्‍ष क्‌ष')&&p[1].content.includes('दूसरा अध्याय'),'Hindi text and deliberate joiners survive');
const safe=sanitizeManuscriptHtml('<script>bad()</script><p onclick="bad()"><a href="javascript:bad()">text</a></p><img src="https://example.test/tracker.png"><img src="data:image/png;base64,aGVsbG8="><table><tr><td>Cell</td></tr></table><p id="word-note-1"><sup>1</sup>Note</p>');
check(!/script|onclick|javascript|tracker/.test(safe),'Unsafe HTML, links and external pictures are removed');
check(safe.includes('<img src="data:image/png;base64,')&&safe.includes('<td>Cell</td>')&&safe.includes('id="word-note-1"'),'Embedded raster pictures, tables and footnote targets survive');
const entries={'[Content_Types].xml':strToU8('<Types/>'),'word/document.xml':strToU8('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body/></w:document>'),'word/_rels/document.xml.rels':strToU8('<Relationships><Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" TargetMode="External" Target="file:///not-allowed.png"/></Relationships>')};
let rejected=false;try{inspectDocxArchive(zipSync(entries).buffer);}catch(e){rejected=/Embed linked/.test(e.message);}check(rejected,'Linked external objects are rejected before conversion');
rejected=false;try{await parseWordManuscript(new File(['x'],'old.doc'));}catch(e){rejected=/docx/.test(e.message);}check(rejected,'Unsupported old Word files get a useful message');
} catch(e){results.push({name:e.message,passed:false});}
document.querySelector('#results').textContent=JSON.stringify({passed:results.every(r=>r.passed),checks:results},null,2);
`;
writeFileSync('public/manuscript-regression.html',`<!doctype html><meta charset="utf-8"><title>Word manuscript checks</title><h1>Word manuscript regression</h1><pre id="results">Running…</pre><script src="/qa-mammoth.js"></script><script type="module">import{unzipSync,strFromU8,zipSync,strToU8}from'/qa-fflate.mjs';${(sanitizer+'\n'+source+'\n'+checks).replaceAll('</script','<\\/script')}</script>`);
console.log('Generated temporary manuscript browser checks. Remove QA assets after running.');
