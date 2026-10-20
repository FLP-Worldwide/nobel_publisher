// Split at DOM boundaries, preserving rich text. Use the remaining space on a
// page even when the next paragraph would also fit on an otherwise empty page.
export function paginateByHeight(html, pageWidth, pageHeight, options = {}) {
  const { margin = 48, firstPageHeading = 0, typography = {} } = options;
  const m = typeof margin === "number" ? { top: margin, bottom: margin, left: margin, right: margin } : margin;
  const box = document.createElement('div');
  box.className = 'manuscript-prose book-typeset';
  Object.assign(box.style, typography, { position: 'fixed', visibility: 'hidden', left: '-10000px', top: '0', display: 'flow-root', width: `${pageWidth - m.left - m.right}px` });
  document.body.appendChild(box);
  const source = document.createElement('div');
  source.innerHTML = html;
  const explicit = node => node.nodeType === 1 && (node.hasAttribute('data-page-break') || /page|always|column|left|right/.test(node.style.breakBefore || node.style.pageBreakBefore || ''));
  const explicitAfter = node => node.nodeType === 1 && /page|always|column|left|right/.test(node.style.breakAfter || node.style.pageBreakAfter || '');
  // Lift nested breaks without discarding formatting, text, or later breaks.
  let marker;
  while ((marker = [...source.querySelectorAll('*')].find(node => node.parentNode !== source && (explicit(node) || explicitAfter(node))))) {
    let block = marker; while (block.parentNode !== source) block = block.parentNode;
    const beforeBreak = explicit(marker);
    const keepMarker = Boolean(marker.textContent);
    marker.removeAttribute('data-page-break');
    for (const key of beforeBreak ? ['break-before', 'page-break-before'] : ['break-after', 'page-break-after']) marker.style.removeProperty(key);
    const before = document.createRange(); before.selectNodeContents(block);
    const after = document.createRange(); after.selectNodeContents(block);
    if (beforeBreak) {
      before.setEndBefore(marker);
      if (keepMarker) after.setStartBefore(marker); else after.setStartAfter(marker);
    } else {
      before.setEndAfter(marker); after.setStartAfter(marker);
    }
    const a = block.cloneNode(false); a.append(before.cloneContents());
    const b = block.cloneNode(false); b.append(after.cloneContents());
    const pageBreak = document.createElement('div'); pageBreak.setAttribute('data-page-break', 'true');
    block.replaceWith(...(a.textContent || a.querySelector('br,img') ? [a] : []), pageBreak, ...(b.textContent || b.querySelector('br,img') ? [b] : []));
  }
  const pages = [];
  let current = [];
  const output = nodes => { const root = document.createElement('div'); root.append(...nodes.map(n => n.cloneNode(true))); return root.innerHTML; };
  const flush = (force = false) => { if (current.length || force) { pages.push(output(current)); current = []; } };
  const fits = nodes => {
    box.replaceChildren(...nodes.map(n => n.cloneNode(true)));
    const limit = pageHeight - m.top - m.bottom - (pages.length === 0 ? firstPageHeading : 0);
    return box.getBoundingClientRect().height <= limit + 0.5;
  };
  function textRuns(element) {
    const runs = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let text = '';
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        runs.push({ node, start: text.length, end: text.length + node.length });
        text += node.textContent;
      } else if (node.tagName === 'BR' || node.tagName === 'IMG') {
        runs.push({ node, start: text.length, end: text.length + 1 });
        text += '\n';
      }
    }
    const ends = new Set([...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(part => part.index + part.segment.length));
    return { runs, ends };
  }
  function boundaries(element, graphemesOnly = false) {
    const points = [];
    const { runs, ends } = textRuns(element);
    for (const { node, start, end } of runs) {
      if (node.nodeType === Node.TEXT_NODE) {
        const offsets = graphemesOnly ? [...ends].filter(offset => offset > start && offset <= end).map(offset => offset - start)
          : [...node.textContent.matchAll(/\s+/gu)].map(match => match.index + match[0].length).concat(node.length);
        for (const offset of offsets) if (offset > 0 && ends.has(start + offset)) points.push([node, offset]);
      } else points.push([node.parentNode, [...node.parentNode.childNodes].indexOf(node) + 1]);
    }
    // Formatting can divide one Indic syllable across several DOM text nodes.
    // Only split at grapheme boundaries in the complete run.
    return points;
  }
  function parts(element, point) {
    const before = document.createRange(); before.selectNodeContents(element); before.setEnd(...point);
    const after = document.createRange(); after.selectNodeContents(element); after.setStart(...point);
    const a = element.cloneNode(false); a.append(before.cloneContents());
    const b = element.cloneNode(false); b.append(after.cloneContents());
    // A paragraph split across pages has no extra paragraph gap at the split.
    a.style.marginBottom = '0';
    b.setAttribute('data-continuation', 'true');
    if (element.tagName === 'OL') b.start = (Number(element.start) || 1) + Math.max(0, a.children.length - 1);
    return [a, b];
  }
  function append(element) {
    if (element.nodeType === Node.TEXT_NODE) { if (!element.textContent.trim()) return; const p = document.createElement('p'); p.textContent = element.textContent; element = p; }
    if (element.nodeType !== 1) return;
    const breakAfter = explicitAfter(element);
    if (explicit(element)) flush(true);
    if (element.hasAttribute('data-page-break') && !element.textContent) return;
    element.removeAttribute('data-page-break');
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
        points = boundaries(remaining, true);
        findSplit();
      }
      if (best < 0 && pages.length === 0 && firstPageHeading > 0 && !current.length) { flush(true); continue; }
      if (best < 0) { current.push(remaining); break; }
      const [a, b] = parts(remaining, points[best]);
      if (!b.textContent && !b.querySelector('br,img')) { current.push(remaining); break; }
      current.push(a); flush(); remaining = b;
    }
    if (breakAfter) flush();
  }
  try { [...source.childNodes].forEach(append); flush(); return pages.length ? pages : ['']; }
  finally { box.remove(); }
}
