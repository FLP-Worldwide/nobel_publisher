import { COVER_GUIDE, coverWrapGeometry } from './printLayout.mjs';
export function coverSafety(design, side, trim) {
  const insetX = COVER_GUIDE.safeInsetIn / trim.width * design.width;
  const insetY = COVER_GUIDE.safeInsetIn / trim.height * design.height;
  const barcode = { x: design.width - insetX - COVER_GUIDE.barcodeWidthIn / trim.width * design.width,
    y: design.height - insetY - COVER_GUIDE.barcodeHeightIn / trim.height * design.height,
    width: COVER_GUIDE.barcodeWidthIn / trim.width * design.width, height: COVER_GUIDE.barcodeHeightIn / trim.height * design.height };
  return { insetX, insetY, barcode };
}
function bounds(e) {
  const radians = (e.rotation || 0) * Math.PI / 180;
  const w = Math.abs(e.w * Math.cos(radians)) + Math.abs(e.h * Math.sin(radians));
  const h = Math.abs(e.w * Math.sin(radians)) + Math.abs(e.h * Math.cos(radians));
  return { x: e.x + e.w / 2 - w / 2, y: e.y + e.h / 2 - h / 2, w, h };
}
export function coverSafetyWarnings(design, side, trim) {
  const { insetX, insetY, barcode } = coverSafety(design,side,trim);
  const layers = design[side].elements.filter(e=>['text','icon'].includes(e.type));
  const warnings = [];
  if (layers.some(e=>{const b=bounds(e);return b.x<insetX||b.y<insetY||b.x+b.w>design.width-insetX||b.y+b.h>design.height-insetY;})) warnings.push('Move text and logos inside the dashed safe area.');
  if (side==='back' && layers.some(e=>{const b=bounds(e);return b.x<barcode.x+barcode.width&&b.x+b.w>barcode.x&&b.y<barcode.y+barcode.height&&b.y+b.h>barcode.y;})) warnings.push('Keep the barcode and MRP area clear of text and logos.');
  return warnings;
}
export function printWrapSize(trim, spineWidthMm) { return coverWrapGeometry(trim.width,trim.height,Number(spineWidthMm)/25.4); }
