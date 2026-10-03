// Split at DOM boundaries, preserving rich text. Use the remaining space on a
// page even when the next paragraph would also fit on an otherwise empty page.
export function paginateByHeight(html, pageWidth, pageHeight, options = {}) {
  const { margin = 48, firstPageHeading = 0, typography = {} } = options;
  const box = document.createElement('div');
  box.className = 'manuscript-prose book-typeset';
  Object.assign(box.style, typography, { position: 'fixed', visibility: 'hidden', left: '-10000px', top: '0', display: 'flow-root', width: `${pageWidth - margin * 2}px` });
  document.body.appendChild(box);
  const source = document.createElement('div');
  source.innerHTML = html;
  const explicit = node => node.nodeType === 1 && (node.hasAttribute('data-page-break') || /page|always|column|left|right/.test(node.style.breakBefore || node.style.pageBreakBefore || ''));
  // Lift a break out of nested Word paragraphs without dropping surrounding text.
  let marker;
  while ((marker = [...source.querySelectorAll('*')].find(node => node.parentNode !== source && explicit(node)))) {
    let block = marker; while (block.parentNode !== source) block = block.parentNode;
    const before = document.createRange(); before.selectNodeContents(block); before.setEndBefore(marker);
    const after = document.createRange(); after.selectNodeContents(block); after.setStartAfter(marker);
    const a = block.cloneNode(false); a.append(before.cloneContents());
    const b = block.cloneNode(false); b.append(after.cloneContents());
    const pageBreak = document.createElement('div'); pageBreak.setAttribute('data-page-break', 'true');
    // A break-before on a text-bearing block retains that block's content.
    if (!marker.hasAttribute('data-page-break') && marker.textContent) b.prepend(marker.cloneNode(true));
    b.querySelectorAll('[style]').forEach(n => { n.style.removeProperty('break-before'); n.style.removeProperty('page-break-before'); });
    block.replaceWith(...(a.textContent || a.querySelector('br') ? [a] : []), pageBreak, b);
  }
  const pages = [];
  let current = [];
  const output = nodes => { const root = document.createElement('div'); root.append(...nodes.map(n => n.cloneNode(true))); return root.innerHTML; };
  const flush = (force = false) => { if (current.length || force) { pages.push(output(current)); current = []; } };
  const fits = nodes => {
    box.replaceChildren(...nodes.map(n => n.cloneNode(true)));
    const limit = pageHeight - margin * 2 - (pages.length === 0 ? firstPageHeading : 0);
    return box.getBoundingClientRect().height <= limit + 0.5;
  };
  function boundaries(element) {
    const points = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const matches = [...node.textContent.matchAll(/\s+/gu)];
        matches.forEach(m => points.push([node, m.index + m[0].length]));
        // End of each text node also permits breaks between formatted spans.
        if (node.length && (!matches.length || points.at(-1)?.[1] !== node.length)) points.push([node, node.length]);
      } else if (node.tagName === 'BR') {
        points.push([node.parentNode, [...node.parentNode.childNodes].indexOf(node) + 1]);
      }
    }
    return points;
  }
  function parts(element, point) {
    const before = document.createRange(); before.selectNodeContents(element); before.setEnd(...point);
    const after = document.createRange(); after.selectNodeContents(element); after.setStart(...point);
    const a = element.cloneNode(false); a.append(before.cloneContents());
    const b = element.cloneNode(false); b.append(after.cloneContents());
    // A paragraph split across pages has no extra paragraph gap at the split.
    a.style.marginBottom = '0';
    if (element.tagName === 'OL') b.start = (Number(element.start) || 1) + Math.max(0, a.children.length - 1);
    return [a, b];
  }
  function append(element) {
    if (element.nodeType === Node.TEXT_NODE) { if (!element.textContent.trim()) return; const p = document.createElement('p'); p.textContent = element.textContent; element = p; }
    if (element.nodeType !== 1) return;
    const breakAfter = /page|always|column|left|right/.test(element.style.breakAfter || element.style.pageBreakAfter || '');
    if (explicit(element)) flush(true);
    if (element.hasAttribute('data-page-break')) return;
    for (const key of ['break-before','page-break-before','break-after','page-break-after']) element.style.removeProperty(key);
    let remaining = element;
    while (remaining) {
      if (fits([...current, remaining])) { current.push(remaining); break; }
      let points = boundaries(remaining);
      let best = -1;
      const findSplit = () => {
        let low = 0, high = points.length - 1;
        while (low <= high) {
          const mid = (low + high) >> 1;
          if (fits([...current, parts(remaining, points[mid])[0]])) { best = mid; low = mid + 1; }
          else high = mid - 1;
        }
      };
      findSplit();
      if (best < 0 && current.length) { flush(); continue; }
      if (best < 0) {
        // Long unbroken words must wrap without splitting a Hindi grapheme.
        points = [];
        const walker = document.createTreeWalker(remaining, NodeFilter.SHOW_TEXT);
        let n;
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        while ((n = walker.nextNode())) for (const part of segmenter.segment(n.textContent)) points.push([n, part.index + part.segment.length]);
        findSplit();
      }
      if (best < 0) { current.push(remaining); break; }
      const [a, b] = parts(remaining, points[best]);
      if (!b.textContent && !b.querySelector('br')) { current.push(remaining); break; }
      current.push(a); flush(); remaining = b;
    }
    if (breakAfter) flush();
  }
  try { [...source.childNodes].forEach(append); flush(); return pages.length ? pages : ['']; }
  finally { box.remove(); }
}
