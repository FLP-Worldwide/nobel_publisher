// CSS pixels at 96 dpi keep points, inches and browser printing consistent.
export const BOOK_DPI = 96;
export const BOOK_MARGIN = 0.5;
export const BOOK_BLEED = 0.125;
const TRIMS = {
  FIVE_X_EIGHT: [5, 8], FIVE_HALF_X_EIGHT_HALF: [5.5, 8.5], SIX_X_NINE: [6, 9],
  EIGHT_HALF_X_EIGHT_HALF: [8.5, 8.5], EIGHT_HALF_X_ELEVEN: [8.5, 11],
};
export function getTrimSize(size, design = {}) {
  const custom = [Number(design.customWidthIn), Number(design.customHeightIn)];
  const [width, height] = size === 'CUSTOM' && custom.every(v => Number.isFinite(v) && v > 1 && v <= 24)
    ? custom : TRIMS[size] || TRIMS.FIVE_X_EIGHT;
  return { width, height, label: `${width} × ${height} in` };
}
export const BOOK_STYLES = [
  { id: 'english-classic', name: 'Classic', language: 'en', description: 'Serif text · centred chapter names', font: 'Georgia, "Times New Roman", serif', points: 11, leading: 1.55, heading: 'centred', numbering: 'label' },
  { id: 'english-modern', name: 'Modern', language: 'en', description: 'Clean sans serif · numbered headings', font: 'Arial, Helvetica, sans-serif', points: 11, leading: 1.55, heading: 'left', numbering: 'number' },
  { id: 'english-literary', name: 'Literary', language: 'en', description: 'Book serif · Roman chapter numbers', font: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif', points: 11.5, leading: 1.55, heading: 'ornament', numbering: 'roman' },
  { id: 'hindi-sahitya', name: 'साहित्य · Sahitya', language: 'hi', description: 'Traditional type · centred अध्याय', font: '"Kohinoor Devanagari", "Noto Serif Devanagari", Mangal, serif', points: 12, leading: 1.65, heading: 'ornament', numbering: 'label' },
  { id: 'hindi-saral', name: 'सरल · Saral', language: 'hi', description: 'Clear type · simple numbered headings', font: '"Noto Sans Devanagari", "Kohinoor Devanagari", Mangal, sans-serif', points: 12, leading: 1.65, heading: 'left', numbering: 'number' },
];
export function stylesForLanguage(language = '') {
  const lang = /hindi|हिंदी|हिन्दी/i.test(language) ? 'hi' : 'en';
  return BOOK_STYLES.filter(style => style.language === lang);
}
export function getBookStyle(id, language) {
  const options = stylesForLanguage(language);
  return options.find(style => style.id === id) || options[0];
}
export function manuscriptStyle(style) {
  return { fontFamily: style.font, fontSize: `${style.points}pt`, lineHeight: style.leading,
    '--book-font': style.font, '--book-size': `${style.points}pt`, '--book-leading': style.leading };
}
function roman(number) {
  let value = Number(number) || 1, result = '';
  for (const [n, symbol] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]) {
    while (value >= n) { result += symbol; value -= n; }
  }
  return result;
}
const escapeHtml = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sectionHeadingHtml(section, style) {
  if (!section?.title) return '';
  const chapter = section.type === 'chapter';
  const number = section.number || 1;
  const label = style.numbering === 'roman' ? roman(number)
    : style.numbering === 'number' ? String(number).padStart(2, '0')
    : `${style.language === 'hi' ? 'अध्याय' : 'Chapter'} ${number}`;
  const defaultTitle = /^(chapter|अध्याय)\s*\d+$/i.test(section.title.trim());
  return `<header class="book-section-heading book-heading-${style.heading}">${chapter ? `<div class="book-chapter-number">${escapeHtml(label)}</div>` : ''}${!chapter || !defaultTitle ? `<h2>${escapeHtml(section.title)}</h2>` : ''}${style.heading === 'ornament' ? '<div class="book-heading-rule" aria-hidden="true">◆</div>' : ''}</header>`;
}
export function measureHeading(section, style, width) {
  const box = document.createElement('div');
  box.className = 'book-typeset';
  Object.assign(box.style, manuscriptStyle(style), { position: 'fixed', visibility: 'hidden', left: '-10000px', width: `${width}px` });
  box.innerHTML = sectionHeadingHtml(section, style);
  document.body.append(box);
  const height = box.getBoundingClientRect().height;
  box.remove();
  return height;
}
