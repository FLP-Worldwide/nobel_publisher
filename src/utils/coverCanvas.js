import { getTrimSize } from './bookLayout';

export const COVER_FONTS = [
  ['serif', 'Literary serif', 'Georgia, "Times New Roman", serif'],
  ['sans', 'Modern sans', 'Arial, Helvetica, sans-serif'],
  ['classic', 'Classic book', 'Palatino, Georgia, serif'],
  ['hindi-serif', 'हिंदी · Serif', '"Nobel Hindi Serif", serif'],
  ['hindi-sans', 'हिंदी · Sans', '"Nobel Hindi Sans", sans-serif'],
];
export const COVER_ICONS = {
  star: 'M12 2 15 8.5 22 9.5 17 14.5 18.2 22 12 18.5 5.8 22 7 14.5 2 9.5 9 8.5Z',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  leaf: 'M20 3C10 2 3 7 4 14c1 7 10 8 14 2 3-4 2-9 2-13ZM5 20 16 8',
  book: 'M12 5C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-1-1-6-2-10 1ZM12 5v16',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 1v2M12 21v2M1 12h2M21 12h2M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2',
};
export const coverFont = key => COVER_FONTS.find(f => f[0] === key)?.[2] || COVER_FONTS[0][2];
export const uid = () => crypto.randomUUID();
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function newCoverDesign(book, theme = 'navy') {
  const trim = getTrimSize(book.design?.size, book.design || {});
  const h = Math.round(600 * trim.height / trim.width);
  const hindi = /hindi|हिंदी|हिन्दी/i.test(book.language || '');
  const palette = theme === 'forest' ? ['#173f36','#ede4d0','#95b8a3'] : theme === 'paper' ? ['#eee8dc','#19334c','#7c927e'] : ['#142b40','#fff8e8','#bba777'];
  const text = (id, value, y, size, bold = false) => ({id,type:'text',text:value,x:60,y,w:480,h:size*3.5,font:hindi?'hindi-serif':'serif',fontSize:size,color:palette[1],bold,italic:false,align:'center',rotation:0,opacity:1});
  return {version:1,width:600,height:h,front:{background:palette[0],elements:[
    {id:uid(),type:'shape',shape:'rectangle',x:58,y:h*.16,w:72,h:4,color:palette[2],rotation:0,opacity:1},
    text(uid(),book.title || 'Your book title',h*.25,50,true),
    text(uid(),book.subheading || 'A story waiting to be told',h*.54,23),
    text(uid(),book.authorName || 'Author name',h*.81,24),
  ]},back:{background:palette[0],elements:[{...text(uid(),book.description || 'Add your book’s description here.',h*.2,23),h:h*.5,align:'left'}]}};
}
export function resizeCover(design, book) {
  const trim = getTrimSize(book.design?.size, book.design || {});
  const height = Math.round(600 * trim.height / trim.width);
  if (height === design.height && design.width === 600) return design;
  const sx = 600 / design.width, sy = height / design.height;
  return {...design,width:600,height,...Object.fromEntries(['front','back'].map(side=>[side,{...design[side],elements:design[side].elements.map(e=>({...e,x:e.x*sx,y:e.y*sy,w:e.w*sx,h:e.h*sy}))}]))};
}
export async function loadCoverFonts(elements) {
  await Promise.all(elements.filter(e=>e.type==='text').map(e=>document.fonts.load(`${e.italic?'italic ':''}${e.bold?700:400} ${e.fontSize}px ${coverFont(e.font)}`,e.text || 'Book')));
}
export function textLines(element) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `${element.italic?'italic ':''}${element.bold?700:400} ${element.fontSize}px ${coverFont(element.font)}`;
  const lines=[];
  for (const paragraph of element.text.split('\n')) {
    let line='';
    for (const token of paragraph.split(/(\s+)/)) {
      if (!token) continue;
      if (ctx.measureText(line+token).width <= element.w) { line+=token; continue; }
      if (line.trim()) {lines.push(line.trimEnd());line='';}
      if (ctx.measureText(token).width <= element.w) {line=token.trimStart();continue;}
      const chars = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(token)].map(s=>s.segment) : Array.from(token);
      for (const char of chars) {
        if(line && ctx.measureText(line+char).width>element.w){lines.push(line);line='';}
        line+=char;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}
export async function imageFileData(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw Error('Choose a JPG, PNG or WebP image.');
  if(file.size>10*1024*1024) throw Error('Choose an image smaller than 10 MB.');
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas'); canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const src=canvas.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.88);
  if(src.length>2200000) throw Error('This image is too detailed to save. Try a smaller JPG or WebP.');
  return {src,width:canvas.width,height:canvas.height};
}
export async function downloadCover(design, side, trim, title) {
  const panel=design[side];await loadCoverFonts(panel.elements);
  const canvas=document.createElement('canvas');canvas.width=Math.round(trim.width*300);canvas.height=Math.round(trim.height*300);
  const ctx=canvas.getContext('2d');ctx.scale(canvas.width/design.width,canvas.height/design.height);ctx.fillStyle=panel.background;ctx.fillRect(0,0,design.width,design.height);
  for(const e of panel.elements){
    ctx.save();ctx.globalAlpha=e.opacity;ctx.translate(e.x+e.w/2,e.y+e.h/2);ctx.rotate(e.rotation*Math.PI/180);ctx.translate(-e.w/2,-e.h/2);ctx.fillStyle=e.color || '#000000';
    if(e.type==='text'){
      ctx.font=`${e.italic?'italic ':''}${e.bold?700:400} ${e.fontSize}px ${coverFont(e.font)}`;ctx.textBaseline='alphabetic';ctx.textAlign=e.align;
      const lines=textLines(e);ctx.beginPath();ctx.rect(0,0,e.w,e.h);ctx.clip();
      lines.forEach((line,i)=>ctx.fillText(line,e.align==='center'?e.w/2:e.align==='right'?e.w:0,e.fontSize+i*e.fontSize*1.3));
    }else if(e.type==='image'){
      const img=new Image();img.src=e.src;await img.decode();const crop=Math.max(e.w/img.width,e.h/img.height);const sw=e.w/crop,sh=e.h/crop;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,e.w,e.h);
    }else if(e.type==='icon'){
      ctx.scale(e.w/24,e.h/24);ctx.lineWidth=1.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=e.color;ctx.stroke(new Path2D(COVER_ICONS[e.icon]));
    }else if(e.shape==='ellipse'){ctx.beginPath();ctx.ellipse(e.w/2,e.h/2,e.w/2,e.h/2,0,0,2*Math.PI);ctx.fill();}
    else ctx.fillRect(0,0,e.w,e.h);
    ctx.restore();
  }
  return {src:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height,filename:`${title.replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,60)||'book'}-${side}-cover-300dpi.png`};
}

// Artwork for a printer review: full back/spine/front wrap at 300 ppi. The
// confirmed spine is never inferred from the sample's 130-page specification.
export async function downloadCoverWrap(design, trim, title) {
  const { printWrapSize } = await import('./coverPrint.mjs');
  if (!design.print?.confirmed || !Number.isFinite(design.print.spineWidthMm)) throw Error('Enter and confirm the spine width supplied by your printer.');
  const size = printWrapSize(trim,design.print.spineWidthMm);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(size.widthIn*300); canvas.height = Math.round(size.heightIn*300);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = design.front.background; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = design.back.background; ctx.fillRect(0,0,size.spineX*300,canvas.height);
  for (const side of ['back','front']) {
    const artwork = await downloadCover(design,side,trim,title);
    const img = new Image(); img.src=artwork.src; await img.decode();
    // Extend the outermost artwork pixels into the printer's bleed allowance.
    const x=(side==='back'?size.backX:size.frontX)*300, y=size.bleedIn*300;
    const w=trim.width*300,h=trim.height*300,b=size.bleedIn*300;
    ctx.drawImage(img,0,0,img.width,1,x,0,w,b);
    ctx.drawImage(img,0,img.height-1,img.width,1,x,y+h,w,b);
    const edge=side==='back'?0:img.width-1;
    ctx.drawImage(img,edge,0,1,img.height,side==='back'?0:x+w,y,b,h);
    ctx.drawImage(img,edge,0,1,1,side==='back'?0:x+w,0,b,b);
    ctx.drawImage(img,edge,img.height-1,1,1,side==='back'?0:x+w,y+h,b,b);
    ctx.drawImage(img,x,y,w,h);
  }
  return {src:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height,filename:`${title.replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,60)||'book'}-full-cover-wrap-300ppi.png`,wrap:true};
}
