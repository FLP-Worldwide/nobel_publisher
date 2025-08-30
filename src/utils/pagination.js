export function paginateByHeight(contentHtml, pageWidth, pageHeight) {
  // Exact content area considering safe margins (0.5 inch = 60px)
  const safeMargin = 60;
  const contentWidth = pageWidth - safeMargin * 2;
  const contentHeight = pageHeight - safeMargin * 2;

  // Create hidden container matching your print layout
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.visibility = "hidden";
  container.style.top = "-10000px";
  container.style.left = "-10000px";
  container.style.width = `${contentWidth}px`;
  container.style.height = `${contentHeight}px`;
  container.style.fontFamily = "serif";
  container.style.fontSize = "14px";
  container.style.lineHeight = "1.625";
  container.style.padding = "0";
  container.style.margin = "0";
  container.style.overflow = "hidden";
  container.style.boxSizing = "border-box";
  container.style.textAlign = "justify";
  container.className = "text-justify leading-6";
  document.body.appendChild(container);

  try {
    // Parse content into paragraphs or block elements
    const tempWrapper = document.createElement("div");
    tempWrapper.innerHTML = contentHtml;
    const outerDiv = tempWrapper.querySelector(".text-justify") || tempWrapper;
    let allParagraphs = Array.from(outerDiv.children);

    if (allParagraphs.length === 0) return [contentHtml];

    function fitsOnPage(els) {
      container.innerHTML = "";
      const c = document.createElement("div");
      c.className = "text-justify leading-6";
      els.forEach(e => c.appendChild(e.cloneNode(true)));
      container.appendChild(c);
      return container.scrollHeight <= container.offsetHeight;
    }

    function createPageHtml(els) {
      const div = document.createElement("div");
      div.className = "text-justify leading-6";
      els.forEach(e => div.appendChild(e.cloneNode(true)));
      return div.innerHTML;
    }

    function splitParagraph(paragraph, currentPageEls) {
      // Binary search for max words that fit with currentPageEls
      const text = paragraph.textContent?.trim() || "";
      if (!text) return [paragraph.cloneNode(true), null];
      const words = text.split(/\s+/);
      if (words.length <= 1) return [paragraph.cloneNode(true), null];

      let low = 1, high = words.length, bestFit = 0;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const testP = paragraph.cloneNode(false);
        if (paragraph.style.cssText) testP.style.cssText = paragraph.style.cssText;
        testP.textContent = words.slice(0, mid).join(" ");
        const testEls = [...currentPageEls, testP];
        if (fitsOnPage(testEls)) {
          bestFit = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      // If no fit at all (very long word/element), forcibly split off first word
      if (bestFit == 0) bestFit = 1;
      if (bestFit >= words.length) return [paragraph.cloneNode(true), null];

      const fitP = paragraph.cloneNode(false);
      if (paragraph.style.cssText) fitP.style.cssText = paragraph.style.cssText;
      fitP.textContent = words.slice(0, bestFit).join(" ");
      const remP = paragraph.cloneNode(false);
      if (paragraph.style.cssText) remP.style.cssText = paragraph.style.cssText;
      remP.textContent = words.slice(bestFit).join(" ");
      return [fitP, remP];
    }

    // MAIN PAGINATION LOOP
    const pages = [];
    let current = [];

    let i = 0;
    while (i < allParagraphs.length) {
      const paragraph = allParagraphs[i];
      if (!paragraph.textContent?.trim() && paragraph.tagName !== "BR") {
        i++; continue;
      }
      let testAdd = [...current, paragraph];

      if (fitsOnPage(testAdd)) {
        current.push(paragraph);
        i++;
      } else {
        // Whether current is empty or not, always split paragraph to fill this page
        if (current.length === 0) {
          // First on page: split relative to empty
          const [fit, rest] = splitParagraph(paragraph, []);
          current.push(fit);
          pages.push(createPageHtml(current));
          current = [];
          if (rest?.textContent?.trim()) {
            // repeat this step with remainder as the next paragraph
            allParagraphs.splice(i + 1, 0, rest);
          }
          i++;
        } else {
          // Not first: split into what fits as last para on current, rest for next
          const [fit, rest] = splitParagraph(paragraph, current);
          current.push(fit);
          pages.push(createPageHtml(current));
          current = [];
          if (rest?.textContent?.trim()) {
            allParagraphs.splice(i + 1, 0, rest);
          }
          i++;
        }
      }
    }
    // any leftovers
    if (current.length > 0) pages.push(createPageHtml(current));
    return pages.length > 0 ? pages : [contentHtml];
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}
