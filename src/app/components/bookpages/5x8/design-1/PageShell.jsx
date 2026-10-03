"use client";

export default function PageShell({
  children,
  trimWidthIn = 5,
  trimHeightIn = 8,
  dpi = 96,
  bleedInches = 0.125,
  safeMarginInches = 0.5,
  showGuides = false,
  pageNumber,
  safeClassName = "",
  useSafeArea = true,
}) {
  const trimWidth = trimWidthIn * dpi;
  const trimHeight = trimHeightIn * dpi;
  const bleed = bleedInches * dpi;
  const safeMargin = safeMarginInches * dpi;
  const fullWidth = trimWidth + bleed * 2;
  const fullHeight = trimHeight + bleed * 2;

  return (
    <div
      className="book-page relative overflow-hidden bg-white font-serif shadow-xl"
      style={{ width: fullWidth, height: fullHeight }}
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
            style={{ top: safeMargin, left: safeMargin, right: safeMargin, bottom: safeMargin }}
          >
            {showGuides && <div className="pointer-events-none absolute inset-0 z-20 border border-dashed border-emerald-500" />}
            {children}
          </div>
        ) : (
          children
        )}
        {pageNumber ? (
          <span
            className={`absolute bottom-5 text-[11px] text-slate-500 ${
              pageNumber % 2 === 0 ? "left-8" : "right-8"
            }`}
          >
            {pageNumber}
          </span>
        ) : null}
      </div>
    </div>
  );
}
