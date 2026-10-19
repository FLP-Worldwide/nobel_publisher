import { sanitizeManuscriptHtml } from "./sanitizeHtml";

export const containsDevanagari = text => /[\u0900-\u097f\ua8e0-\ua8ff]/u.test(String(text || ""));

export function prepareManuscriptPaste({ html = "", text = "", mode = "auto" } = {}) {
  // Plain clipboard text avoids PDF/Word spans interrupting an Indic syllable.
  // Preserve the supplied Unicode, including deliberate ZWJ/ZWNJ characters.
  const usePlain = text.length > 0 && (mode === "plain" || !html || (mode === "auto" && containsDevanagari(text)));
  if (!usePlain) return sanitizeManuscriptHtml(html);
  return String(text).replace(/\r\n?/g, "\n")
    .replace(/[&<>]/g, value => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[value]))
    .replace(/\n/g, "<br>");
}

export function hasDetachedDevanagariMarks(text = "") {
  // Report clear orphan marks; never try to infer the author's intended words.
  return /(?:^|[\s\u25cc])[\u093a-\u094f\u0951-\u0957\u0962\u0963]/u.test(text) || text.includes("\ufffd");
}
