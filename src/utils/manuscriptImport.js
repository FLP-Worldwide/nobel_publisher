import { unzipSync, strFromU8 } from 'fflate';
import { sanitizeManuscriptHtml } from '@/app/components/editor/sanitizeHtml';

export const MAX_IMPORT_BYTES = 3 * 1024 * 1024;
const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const frontNames = /^(dedication|foreword|preface|acknowledg(e)?ments|prologue(?:\s*\/\s*introduction)?|introduction|समर्पण|भूमिका|आभार|प्रस्तावना)$/i;
const generatedNames = /^(title page|contents|table of contents|copyright|कॉपीराइट|सर्वाधिकार)$/i;
const parseXml = value => {
  const doc = new DOMParser().parseFromString(value, 'application/xml');
  if (doc.querySelector('parsererror')) throw Error('This Word file could not be read. Save a fresh .docx copy in Word and try again.');
  return doc;
};

export function inspectDocxArchive(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes.length > 10 * 1024 * 1024) throw Error('Choose a Word document smaller than 10 MB.');
  let total = 0, count = 0;
  // Inspect the ZIP directory before inflating any document content.
  unzipSync(bytes, { filter: file => {
    total += file.originalSize; count++;
    if (total > 40 * 1024 * 1024 || file.originalSize > 12 * 1024 * 1024 || count > 3000) throw Error('This document is too large to import. Split it into smaller Word files.');
    if (/vbaProject|activeX\//i.test(file.name)) throw Error('Use a .docx file without macros or embedded controls.');
    return false;
  } });
  const xml = unzipSync(bytes, { filter: file => ['[Content_Types].xml', 'word/document.xml', 'word/settings.xml', 'word/_rels/document.xml.rels'].includes(file.name) });
  if (!xml['word/document.xml'] || !xml['[Content_Types].xml']) throw Error('Choose a valid .docx document. PDF and older .doc files are not supported here.');
  const documentXml = parseXml(strFromU8(xml['word/document.xml']));
  const get = (element, attr) => Number(element?.getAttributeNS(W, attr));
  const sections = [...documentXml.getElementsByTagNameNS(W, 'sectPr')].map(section => {
    const size = section.getElementsByTagNameNS(W, 'pgSz')[0], margin = section.getElementsByTagNameNS(W, 'pgMar')[0];
    return { widthIn: get(size, 'w') / 1440, heightIn: get(size, 'h') / 1440, topCm: get(margin, 'top') / 1440 * 2.54,
      bottomCm: get(margin, 'bottom') / 1440 * 2.54, insideCm: get(margin, 'left') / 1440 * 2.54, outsideCm: get(margin, 'right') / 1440 * 2.54, gutterCm: get(margin, 'gutter') / 1440 * 2.54 };
  });
  const settings = xml['word/settings.xml'] ? parseXml(strFromU8(xml['word/settings.xml'])) : null;
  if (xml['word/_rels/document.xml.rels']) {
    const relationships = parseXml(strFromU8(xml['word/_rels/document.xml.rels']));
    if ([...relationships.documentElement.children].some(item => item.getAttribute('TargetMode') === 'External' && !/\/hyperlink$/.test(item.getAttribute('Type') || ''))) throw Error('Embed linked pictures or objects in your Word file before uploading it.');
  }
  return { sections, mirrorMargins: Boolean(settings?.getElementsByTagNameNS(W, 'mirrorMargins').length),
    trackedChanges: Boolean(documentXml.getElementsByTagNameNS(W, 'ins').length || documentXml.getElementsByTagNameNS(W, 'del').length),
    pageBreaks: [...documentXml.getElementsByTagNameNS(W, 'br')].some(item => item.getAttributeNS(W, 'type') === 'page') };
}

export function splitConvertedManuscript(html, filename = 'Manuscript') {
  const root = new DOMParser().parseFromString(html, 'text/html').body;
  const sections = [];
  let current = null;
  const start = title => { if(title.trim().length>200) throw Error('One heading is longer than 200 characters. Shorten that heading in Word and upload again.'); current = { title: title.trim() || 'Untitled section', content: '', type: frontNames.test(title.trim()) ? 'intro' : 'chapter' }; sections.push(current); };
  for (const node of [...root.children]) {
    const text = node.textContent.trim();
    if (node.classList.contains('import-title')) { start('Title page'); current.content += node.outerHTML; continue; }
    if (node.classList.contains('import-toc')) { if (current?.title !== 'Contents') start('Contents'); current.content += node.outerHTML; continue; }
    if (/^(?:copyright\s*©|©\s*\d{4})/i.test(text) && current?.title !== 'Copyright') start('Copyright');
    if (node.classList.contains('import-dedication') && current?.title !== 'Dedication') start('Dedication');
    if (node.tagName === 'H1') { start(text); continue; }
    if (!current) start(filename.replace(/\.docx$/i, '') || 'Manuscript');
    current.content += node.outerHTML;
  }
  const nonempty = sections.filter(section => section.content.replace(/<[^>]*>/g, '').trim() || /<img\b/.test(section.content));
  if (!nonempty.length) throw Error('This document has no manuscript text to import.');
  return nonempty.map((section, index) => ({ ...section, id: `section-${index}`, content: sanitizeManuscriptHtml(section.content), include: !generatedNames.test(section.title),
    explanation: generatedNames.test(section.title) ? 'Optional: Nobel already creates this page. Include only if you want to use your own copyright text; title and contents pages are rebuilt from your book.' : '' }));
}

export async function parseWordManuscript(file) {
  if (!/\.docx$/i.test(file.name)) throw Error('Choose a .docx document saved from Microsoft Word or Google Docs.');
  if (file.size > 10 * 1024 * 1024) throw Error('Choose a Word document smaller than 10 MB.');
  const arrayBuffer = await file.arrayBuffer();
  let inspection;
  try { inspection = inspectDocxArchive(arrayBuffer); }
  catch (error) { if (typeof error.code === "number") throw Error("This file could not be read as a Word document. Save a fresh .docx copy and try again."); throw error; }
  const { default: mammoth } = await import('mammoth/mammoth.browser');
  const converted = await mammoth.convertToHtml({ arrayBuffer }, {
    externalFileAccess: false, includeEmbeddedStyleMap: false, idPrefix: `word-${crypto.randomUUID()}-`,
    styleMap: [
      "p[style-name='Book title_front page'] => p.import-title:fresh",
      "p[style-name='Dedication text'] => p.import-dedication:fresh",
      ...[1,2,3,4,5,6,7,8,9].map(i => `p[style-name='toc ${i}'] => p.import-toc:fresh`),
      "p[style-name='TOC Heading'] => h1:fresh",
    ],
    convertImage: mammoth.images.imgElement(async image => {
      if (!['image/png','image/jpeg','image/webp'].includes(image.contentType)) throw Error('Convert embedded pictures to PNG or JPG before uploading your document.');
      const base64 = await image.read('base64');
      if (base64.length > 1500000) throw Error('An embedded picture is too large. Resize the image in Word and upload the document again.');
      return { src: `data:${image.contentType};base64,${base64}` };
    }),
  });
  if (converted.messages.some(message => message.type === 'error')) throw Error('Some document content could not be imported. Check embedded pictures and objects in Word, then try again.');
  const sections = splitConvertedManuscript(converted.value, file.name);
  const warnings = ['Word page positions, headers, footers and contents numbers are rebuilt for your selected print size. Check the complete book proof before submitting.'];
  if (!inspection.sections.length || inspection.sections.some(section => Math.abs(section.widthIn - 5) > .02 || Math.abs(section.heightIn - 8) > .02)) warnings.push('The source uses a different page size. The supplied guide is for 5 × 8 inches; imported text will reflow to your saved print settings.');
  if (!inspection.mirrorMargins || inspection.sections.some(s => Math.abs(s.topCm - 1.93) > .05 || Math.abs(s.bottomCm - 1.93) > .05 || Math.abs(s.insideCm - 1.93) > .05 || Math.abs(s.outsideCm - 1.52) > .05 || Math.abs(s.gutterCm - .36) > .05)) warnings.push('The source margins differ from the guide. The book proof will apply the mirrored interior margins and binding gutter.');
  if (inspection.trackedChanges) warnings.push('The document contains tracked changes. Insertions are imported and deleted text is omitted. Review the imported text carefully.');
  if (/lorem ipsum|Enter Chapter Name|Enter Dedication|Your Book Title|Notion Press Platform/i.test(rootText(converted.value))) warnings.push('Template instructions, sample text or another platform’s credits were found. Remove anything that does not belong to your book before submission.');
  if (/<img\b|<table\b/.test(converted.value)) warnings.push('Pictures and tables were imported. Check every page for fit and image quality; use at least 300 pixels per printed inch for pictures.');
  if (converted.messages.length) warnings.push('Some Word styles cannot be reproduced exactly. Text is formatted using your selected book style; inspect the section previews below.');
  if (new TextEncoder().encode(JSON.stringify(sections)).length > MAX_IMPORT_BYTES) throw Error('The converted manuscript is larger than 3 MB. Split it into smaller Word documents or reduce picture sizes.');
  return { sections, warnings, inspection, filename: file.name };
}
const rootText = html => new DOMParser().parseFromString(html, 'text/html').body.textContent;
