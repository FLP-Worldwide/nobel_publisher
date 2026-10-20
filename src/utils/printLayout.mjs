// Interior measurements from the supplied 5 × 8 reference guide. In mirror
// margins the binding allowance is added to the inside margin, then mirrored.
export const INTERIOR = Object.freeze({ topCm: 1.93, bottomCm: 1.93, insideCm: 1.93, outsideCm: 1.52, gutterCm: 0.36, headerCm: 0.89, footerCm: 0.89, firstLineIndentCm: 0.5 });
export const COVER_GUIDE = Object.freeze({ bleedIn: 0.139, safeInsetIn: 0.5, sampleSpineIn: 0.305, samplePages: 130, barcodeWidthIn: 1.75, barcodeHeightIn: 1.08 });
export function interiorMargins(physicalPage = 1, dpi = 96) {
  const cm = value => value / 2.54 * dpi;
  const inside = cm(INTERIOR.insideCm + INTERIOR.gutterCm), outside = cm(INTERIOR.outsideCm);
  return { top: cm(INTERIOR.topCm), bottom: cm(INTERIOR.bottomCm), left: physicalPage % 2 ? inside : outside, right: physicalPage % 2 ? outside : inside };
}
export function interiorContentSize(widthIn, heightIn, dpi = 96) {
  const m = interiorMargins(1, dpi);
  return { width: widthIn * dpi - m.left - m.right, height: heightIn * dpi - m.top - m.bottom };
}
export function lowerRoman(value) {
  let n = value, out = '';
  for (const [amount, symbol] of [[1000,'m'],[900,'cm'],[500,'d'],[400,'cd'],[100,'c'],[90,'xc'],[50,'l'],[40,'xl'],[10,'x'],[9,'ix'],[5,'v'],[4,'iv'],[1,'i']]) while (n >= amount) { out += symbol; n -= amount; }
  return out;
}
export const frontMatterOrder = title => {
  const value = title.toLowerCase().trim();
  return /dedication|समर्पण/.test(value) ? 0 : /foreword|प्राक्कथन/.test(value) ? 1 : /preface|भूमिका/.test(value) ? 2 : /acknowledg|आभार/.test(value) ? 3 : 4;
};
export function assemblePrintPages(groups, contentsPerPage = 18, copyrightFragments = [null]) {
  const pages = [{ key: 'title', kind: 'title', label: 'Title page' }, ...copyrightFragments.map((fragment, index) => ({ key: `copyright-${index}`, kind: 'copyright', label: index ? 'Copyright, continued' : 'Copyright', fragment }))];
  const navigation = [{ label: 'Title page', pageIndex: 0, sectionIndex: null }, { label: 'Copyright', pageIndex: 1, sectionIndex: null }];
  const indexEntries = [];
  let arabic = null;
  const blank = key => { pages.push({ key, kind: 'blank', label: 'Blank page' }); if (arabic !== null) arabic++; };
  const rightHandStart = key => { if (pages.length % 2) blank(`blank-before-${key}`); };
  const appendSection = ({ section, fragments, sectionIndex }) => {
    rightHandStart(section.id);
    if (section.group !== 'Front matter' && arabic === null) arabic = 1;
    const entry = { title: section.title, page: arabic ?? lowerRoman(pages.length + 1) };
    indexEntries.push(entry);
    navigation.push({ label: section.title, group: section.group, pageIndex: pages.length, sectionIndex });
    (fragments.length ? fragments : ['']).forEach((fragment, fragmentIndex) => {
      const physical = pages.length + 1;
      pages.push({ key: `${section.id}-${fragmentIndex}`, kind: section.group === 'Back matter' ? 'backmatter' : 'section',
        label: fragmentIndex ? `${section.title}, continued` : section.title, section, sectionIndex, fragment, fragmentIndex,
        pageNumber: arabic ?? lowerRoman(physical), showPageNumber: fragmentIndex > 0 });
      if (arabic !== null) arabic++;
    });
  };
  const prepared = groups.map((group, sectionIndex) => ({ ...group, sectionIndex }));
  const front = prepared.filter(group => group.section.group === 'Front matter').sort((a,b) => frontMatterOrder(a.section.title) - frontMatterOrder(b.section.title));
  front.filter(group => frontMatterOrder(group.section.title) === 0).forEach(appendSection);
  rightHandStart('contents');
  navigation.push({ label: 'Contents', pageIndex: pages.length, sectionIndex: null });
  const contentsPages = [];
  const chunks = Array.isArray(contentsPerPage) ? contentsPerPage : Array.from({ length: Math.max(1, Math.ceil(groups.length / contentsPerPage)) }, (_,i) => Math.min(contentsPerPage, Math.max(0, groups.length - i * contentsPerPage)));
  const count = chunks.length;
  for (let i = 0; i < count; i++) {
    const page = { key: `contents-${i}`, kind: 'contents', label: i ? 'Contents, continued' : 'Contents', entries: [], pageNumber: lowerRoman(pages.length + 1), showPageNumber: i > 0 };
    contentsPages.push(page); pages.push(page);
  }
  front.filter(group => frontMatterOrder(group.section.title) !== 0).forEach(appendSection);
  prepared.filter(group => group.section.group !== 'Front matter').forEach(appendSection);
  let contentsOffset = 0;
  contentsPages.forEach((page, i) => { page.entries = indexEntries.slice(contentsOffset, contentsOffset + chunks[i]); contentsOffset += chunks[i]; });
  if (pages.length % 2) blank('blank-end');
  return { pages, navigation, indexEntries };
}
export function coverWrapGeometry(widthIn, heightIn, spineIn) {
  if (![widthIn,heightIn,spineIn].every(Number.isFinite) || widthIn <= 0 || heightIn <= 0 || spineIn < 0 || spineIn > 4) throw Error('Enter a valid printer-confirmed spine width.');
  const bleed = COVER_GUIDE.bleedIn;
  return { widthIn: 2 * widthIn + spineIn + 2 * bleed, heightIn: heightIn + 2 * bleed, bleedIn: bleed,
    backX: bleed, spineX: bleed + widthIn, frontX: bleed + widthIn + spineIn, spineIn };
}
