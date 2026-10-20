const ALLOWED_TAGS = new Set([
  "A",
  "IMG", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TH", "TD", "CAPTION", "SUP", "SUB",
  "B",
  "BLOCKQUOTE",
  "BR",
  "DIV",
  "EM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "I",
  "LI",
  "OL",
  "P",
  "S",
  "STRIKE",
  "STRONG",
  "SPAN",
  "HR",
  "U",
  "UL",
]);

const DROP_WITH_CONTENT = new Set([
  "EMBED",
  "FORM",
  "IFRAME",
  "MATH",
  "OBJECT",
  "SCRIPT",
  "STYLE",
  "SVG",
  "TEMPLATE",
]);

const SAFE_STYLE_PROPERTIES = new Set([
  "font-style",
  "font-weight",
  "text-align",
  "text-decoration",
  "break-before",
  "break-after",
  "page-break-before",
  "page-break-after",
]);

function safeHref(value) {
  const href = value.trim();
  return /^(https?:|mailto:|#|\/)/i.test(href) ? href : "";
}

function safeStyle(value) {
  return value
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator < 0) return "";
      const property = declaration.slice(0, separator).trim().toLowerCase();
      const propertyValue = declaration.slice(separator + 1).trim();
      if (!SAFE_STYLE_PROPERTIES.has(property) || /url\s*\(|expression\s*\(/i.test(propertyValue)) return "";
      return `${property}: ${propertyValue}`;
    })
    .filter(Boolean)
    .join("; ");
}

export function sanitizeManuscriptHtml(html = "") {
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    return String(html)
      .replace(/<(script|style|iframe|object|embed|svg|math|form|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript\s*:/gi, "");
  }

  const documentValue = new window.DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = documentValue.body.firstElementChild;
  if (!root) return "";

  [...root.querySelectorAll("*")].forEach((element) => {
    if (DROP_WITH_CONTENT.has(element.tagName)) {
      element.remove();
      return;
    }
    if (!ALLOWED_TAGS.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    if (element.classList.contains("page-break") || element.classList.contains("pagebreak")) element.setAttribute("data-page-break", "true");
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name === "id" && /^[a-z][a-z0-9_.:-]{0,120}$/i.test(attribute.value)) return;
      if (["TD", "TH"].includes(element.tagName) && ["colspan", "rowspan"].includes(name) && /^[1-9]\d?$/.test(attribute.value)) return;
      if (element.tagName === "IMG" && name === "alt") return;
      if (element.tagName === "IMG" && name === "src" && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(attribute.value) && attribute.value.length <= 1500000) return;

      if (element.tagName === "OL" && name === "start" && /^\d+$/.test(attribute.value)) return;
      if (name === "data-continuation") { element.setAttribute(name, "true"); return; }
      if (name === "data-page-break") { element.setAttribute(name, "true"); return; }
      if (name === "style") {
        const style = safeStyle(attribute.value);
        if (style) element.setAttribute("style", style);
        else element.removeAttribute(attribute.name);
        return;
      }
      if (element.tagName === "A" && name === "href") {
        const href = safeHref(attribute.value);
        if (href) element.setAttribute("href", href);
        else element.removeAttribute(attribute.name);
        return;
      }
      element.removeAttribute(attribute.name);
    });

    if (element.tagName === "IMG" && !element.getAttribute("src")) { element.remove(); return; }
    if (element.tagName === "A") {
      element.setAttribute("rel", "noopener noreferrer");
    }
    // Imported editors often wrap each Hindi glyph in a font/position span.
    // Once those styles are removed, keep one shaping run rather than empty wrappers.
    if (element.tagName === "SPAN" && !element.attributes.length) {
      element.replaceWith(...element.childNodes);
    }
  });

  root.normalize();
  return root.innerHTML.replace(/(?:<br\s*\/?>(?:\s|&nbsp;)*){3,}/gi, "<br><br>");
}
