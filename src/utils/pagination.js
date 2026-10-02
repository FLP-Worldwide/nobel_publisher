// Measure with the same typography as the printed page. DOM ranges retain all
// inline formatting when a paragraph crosses a page boundary.
export function paginateByHeight(html, pageWidth, pageHeight) {
  const box = document.createElement('div');
  box.className = 'manuscript-prose print-manuscript';
  Object.assign(box.style, { position: 'fixed', visibility: 'hidden', left: '-10000px', top: '0', width: `${pageWidth - 120}px`, height: 'auto', fontFamily: 'Georgia, "Times New Roman", serif' });
  document.body.appendChild(box);
  const source = document.createElement('div');
  source.innerHTML = html;
  // Word and contentEditable may nest explicit breaks inside a paragraph.
  let marker;
  while ((marker = [...source.querySelectorAll('[data-page-break], br[style]')].find(node => node.parentNode !== source && (node.hasAttribute('data-page-break') || /page|always/.test(node.style.breakBefore || node.style.pageBreakBefore || ''))))) {
    let block = marker; while (block.parentNode !== source) block = block.parentNode;
    const before = document.createRange(); before.selectNodeContents(block); before.setEndBefore(marker);
    const after = document.createRange(); after.selectNodeContents(block); after.setStartAfter(marker);
    const a = block.cloneNode(false); a.append(before.cloneContents());
    const b = block.cloneNode(false); b.append(after.cloneContents());
    const pageBreak = document.createElement('div'); pageBreak.setAttribute('data-page-break', 'true');
    block.replaceWith(a, pageBreak, b);
  }
  const pages = [];
  let current = [];
  const limit = pageHeight - 120;
  const output = nodes => nodes.map(n => n.outerHTML || n.textContent).join('');
  const flush = () => { if (current.length) { pages.push(output(current)); current = []; } };
  const fits = nodes => { box.replaceChildren(...nodes.map(n => n.cloneNode(true))); return box.getBoundingClientRect().height <= limit; };
  function parts(element, offset) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node; let used = 0;
    while ((node = walker.nextNode())) {
      if (used + node.length >= offset) {
        const before = document.createRange(); before.selectNodeContents(element); before.setEnd(node, offset - used);
        const after = document.createRange(); after.selectNodeContents(element); after.setStart(node, offset - used);
        const a = element.cloneNode(false); a.append(before.cloneContents());
        const b = element.cloneNode(false); b.append(after.cloneContents());
        return [a, b];
      }
      used += node.length;
    }
    return [element.cloneNode(true), null];
  }
  function append(element) {
    if (element.nodeType === Node.TEXT_NODE) { if (!element.textContent.trim()) return; const p = document.createElement('p'); p.textContent = element.textContent; element = p; }
    const before = element.style?.breakBefore || element.style?.pageBreakBefore;
    const after = element.style?.breakAfter || element.style?.pageBreakAfter;
    if (/page|always|left|right/.test(before || '') || element.hasAttribute('data-page-break')) flush();
    if (element.hasAttribute('data-page-break')) return;
    element.style?.removeProperty('break-before'); element.style?.removeProperty('page-break-before');
    element.style?.removeProperty('break-after'); element.style?.removeProperty('page-break-after');
    if (fits([...current, element])) current.push(element);
    else {
      // Keep paragraphs together whenever they fit on a fresh page.
      if (current.length && fits([element])) { flush(); current.push(element); }
      else {
        const text = element.textContent || '';
        const offsets = [...text.matchAll(/\s+/gu)].map(m => m.index + m[0].length);
        if (!offsets.length) for (let i = 1; i < text.length; i++) offsets.push(i);
        let low = 0, high = offsets.length - 1, best = -1;
        while (low <= high) { const mid = (low + high) >> 1; const [part] = parts(element, offsets[mid]); if (fits([...current, part])) { best = mid; low = mid + 1; } else high = mid - 1; }
        if (best < 0 && current.length) { flush(); append(element); return; }
        if (best >= 0 && offsets[best] < text.length) { const [a,b] = parts(element, offsets[best]); current.push(a); flush(); if (b) append(b); }
        else { current.push(element); flush(); }
      }
    }
    if (/page|always|left|right/.test(after || '')) flush();
  }
  try { [...source.childNodes].forEach(append); flush(); return pages.length ? pages : ['']; }
  finally { box.remove(); }
}
