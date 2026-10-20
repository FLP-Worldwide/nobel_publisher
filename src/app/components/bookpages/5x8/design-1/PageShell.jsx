"use client";
import { INTERIOR, interiorMargins } from "@/utils/printLayout.mjs";
import { getBookStyle, manuscriptStyle } from "@/utils/bookLayout";

export default function PageShell({
  children,
  bookStyle = getBookStyle(),
  trimWidthIn = 5,
  trimHeightIn = 8,
  dpi = 96,
  bleedInches = 0,
  safeMarginInches = 0.5,
  showGuides = false,
  pageNumber,
  physicalPageNumber = 1,
  runningHeader,
  safeClassName = "",
  useSafeArea = true,
}) {
  const trimWidth = trimWidthIn * dpi;
  const trimHeight = trimHeightIn * dpi;
  const bleed = bleedInches * dpi;
  const margins = interiorMargins(physicalPageNumber, dpi);
  const fullWidth = trimWidth + bleed * 2;
  const fullHeight = trimHeight + bleed * 2;

  return (
    <div
      lang={bookStyle.language}
      data-physical-page={physicalPageNumber}
      className="book-page relative overflow-hidden bg-white shadow-xl"
      style={{ ...manuscriptStyle(bookStyle), "--book-content-height": `${trimHeight - margins.top - margins.bottom - 24}px`, width: fullWidth, height: fullHeight }}
    >
      {showGuides && <div className="pointer-events-none absolute inset-0 z-20 border border-fuchsia-400" />}
      <div
        className="absolute bg-white"
        style={{ top: bleed, left: bleed, width: trimWidth, height: trimHeight }}
      >
        {showGuides && <div className="pointer-events-none absolute inset-0 z-20 border border-blue-400" />}
        {useSafeArea ? (
          <div
            className={`absolute overflow-hidden ${safeClassName}`}
            style={{ top: margins.top, left: margins.left, right: margins.right, bottom: margins.bottom }}
          >
            {showGuides && <div className="pointer-events-none absolute inset-0 z-20 border border-dashed border-emerald-500" />}
            {children}
          </div>
        ) : (
          children
        )}
        {runningHeader && <span className="absolute truncate text-center text-[9px] text-slate-500" style={{ top: INTERIOR.headerCm / 2.54 * dpi, left: margins.left, right: margins.right }}>{runningHeader}</span>}
        {pageNumber ? <span className="absolute text-[10px] text-slate-500" style={{ bottom: INTERIOR.footerCm / 2.54 * dpi, ...(physicalPageNumber % 2 === 0 ? { left: margins.left } : { right: margins.right }) }}>{pageNumber}</span> : null}

      </div>
    </div>
  );
}
