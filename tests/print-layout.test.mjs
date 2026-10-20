import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INTERIOR, interiorMargins, interiorContentSize, assemblePrintPages, coverWrapGeometry } from '../src/utils/printLayout.mjs';
import { copyrightParagraphs, copyrightHtml } from '../src/utils/copyright.mjs';
import { coverSafetyWarnings } from '../src/utils/coverPrint.mjs';
const group=(id,title,count=1,group='Chapters')=>({section:{id,title,group,type:'chapter'},fragments:Array.from({length:count},(_,i)=>`<p>${id} ${i}</p>`)});

test('the supplied interior measurements mirror the binding gutter and keep a constant type area',()=>{
  const right=interiorMargins(1),left=interiorMargins(2);
  assert.equal(right.left,left.right);assert.equal(right.right,left.left);
  assert.equal(right.left, (1.93+.36)/2.54*96);
  assert.equal(right.top,1.93/2.54*96);
  const size=interiorContentSize(5,8);
  assert.ok(Math.abs(size.width/96-(5-2.29/2.54-1.52/2.54))<1e-10);
  assert.equal(INTERIOR.firstLineIndentCm,.5);
});

test('front matter follows the guide and Arabic numbering starts at the body, with opening folios hidden',()=>{
  const groups=[group('preface','Preface',2,'Front matter'),group('dedication','Dedication',1,'Front matter'),group('foreword','Foreword',1,'Front matter'),group('chapter1','One',2),group('chapter2','Two',1),group('end','Epilogue',2,'Back matter')];
  const {pages,indexEntries,navigation}=assemblePrintPages(groups,3);
  assert.equal(pages.length%2,0);
  assert.deepEqual(pages.filter(p=>p.fragmentIndex===0).map(p=>p.section.id),['dedication','foreword','preface','chapter1','chapter2','end']);
  pages.forEach((p,i)=>{if(p.fragmentIndex===0){assert.equal((i+1)%2,1);assert.equal(p.showPageNumber,false);}});
  assert.equal(indexEntries.find(e=>e.title==='One').page,1);
  assert.equal(indexEntries.find(e=>e.title==='Two').page,3);
  assert.equal(indexEntries.find(e=>e.title==='Epilogue').page,5);
  assert.match(String(indexEntries.find(e=>e.title==='Preface').page),/^[ivxlcdm]+$/);
  assert.equal(pages.filter(p=>p.kind==='contents').flatMap(p=>p.entries).length,groups.length);
  navigation.filter(item=>item.sectionIndex!==null).forEach(item=>assert.equal(pages[item.pageIndex].section.title,item.label));
});

test('long contents and copyright pages do not silently disappear or change the actual TOC targets',()=>{
  const {pages,indexEntries}=assemblePrintPages(Array.from({length:70},(_,i)=>group(`c${i}`,`Chapter ${i+1}`)),12,['<p>Copyright first</p>','<p>Copyright continued</p>']);
  assert.equal(pages.filter(p=>p.kind==='copyright').length,2);
  assert.equal(pages.filter(p=>p.kind==='contents').length,6);
  assert.equal(pages.filter(p=>p.kind==='contents').flatMap(p=>p.entries).length,70);
  assert.equal(indexEntries[69].page,139);
});

test('cover wrap uses the confirmed spine and includes the sample bleed exactly once at each outer edge',()=>{
  const size=coverWrapGeometry(5,8,.305);
  assert.equal(size.widthIn,10.583);assert.equal(size.heightIn,8.278);
  assert.ok(coverWrapGeometry(5,8,.6).widthIn>size.widthIn);
  assert.throws(()=>coverWrapGeometry(5,8,-1));
  const design={width:600,height:960,back:{elements:[{type:'text',x:370,y:750,w:100,h:100,rotation:0}]}};
  assert.ok(coverSafetyWarnings(design,'back',{width:5,height:8}).some(w=>/barcode/.test(w)));
});

test('copyright identifies the author or chosen rights holder and respects legal exceptions',()=>{
  const paragraphs=copyrightParagraphs({copyrightHolder:'A Writer',copyrightYear:2026,copyright:'Cover illustration by Test Artist'});
  assert.equal(paragraphs[0],'Copyright © 2026 A Writer');
  assert.ok(paragraphs.some(p=>p.includes('except as permitted by applicable copyright law')));
  assert.ok(paragraphs.includes('Self-published through Nobel Books.'));
  assert.doesNotMatch(paragraphs[0],/Nobel/);
  assert.match(copyrightHtml({author:'<script>unsafe</script>'}),/&lt;script&gt;/);
});
