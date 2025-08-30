import Hypher from "hypher";
import english from "hyphenation.en-us";

const h = new Hypher(english);
export function paginateByHeight(contentHtml, pageWidth, pageHeight) {
  const container = document.createElement("div");
  container.style.width = `${pageWidth}px`;
  container.style.position = "absolute";
  container.style.visibility = "hidden";
  container.style.lineHeight = "1.6";
  container.style.fontFamily = "serif";
  container.style.fontSize = "14px";
  container.style.whiteSpace = "normal";
  container.style.wordWrap = "break-word";
  document.body.appendChild(container);

  container.innerHTML = contentHtml;

  const range = document.createRange();
  const pages = [];
  let currentPage = document.createElement("div");

  function pushPage() {
    if (currentPage.innerHTML.trim()) {
      pages.push(currentPage.innerHTML);
      currentPage = document.createElement("div");
    }
  }

  function splitTextNode(node, limitBottom) {
    for (let i = 1; i <= node.textContent.length; i++) {
      range.setStart(node, 0);
      range.setEnd(node, i);

      const rects = range.getClientRects();
      const lastRect = rects[rects.length - 1];
      if (!lastRect) continue;

      const bottom = lastRect.bottom - container.getBoundingClientRect().top;
      if (bottom > limitBottom) {
        return [
          document.createTextNode(node.textContent.slice(0, i - 1)), // fit part
          document.createTextNode(node.textContent.slice(i - 1)),    // remainder
        ];
      }
    }
    return [node.cloneNode(true), null];
  }

  function processNodes(nodes) {
    for (let idx = 0; idx < nodes.length; idx++) {
      const node = nodes[idx];

      container.innerHTML = "";
      container.appendChild(currentPage.cloneNode(true));
      container.appendChild(node.cloneNode(true));

      if (container.scrollHeight > pageHeight) {
        if (node.nodeType === Node.TEXT_NODE) {
          const [first, rest] = splitTextNode(node, pageHeight);

          if (first) currentPage.appendChild(first);
          pushPage();

          if (rest) {
            // rest text + remaining siblings
            const wrapper = document.createElement("p");
            wrapper.appendChild(rest);
            processNodes([wrapper, ...nodes.slice(idx + 1)]);
          } else {
            processNodes(nodes.slice(idx + 1));
          }
          return;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = node.cloneNode(false);
          currentPage.appendChild(clone);

          let childNodes = Array.from(node.childNodes);
          pushPage();

          // ✅ add same block remainder + next siblings
          processNodes([...childNodes, ...nodes.slice(idx + 1)]);
          return;
        }
      } else {
        currentPage.appendChild(node.cloneNode(true));
      }
    }
  }

  processNodes(Array.from(container.childNodes));
  pushPage();

  document.body.removeChild(container);
  return pages;
}
