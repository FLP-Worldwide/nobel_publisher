"use client";
import React from "react";

export default function ChapterPage({
  section,
  trimWidthIn = 5,
  trimHeightIn = 8,
  dpi = 120,
  bleedInches = 0.125, // 1/8 inch bleed
  safeMarginInches = 0.5, // safe area for text
  showGuides = false, // show guides for debug
}) {
  // Convert trim size to px
  const trimWidth = trimWidthIn * dpi;
  const trimHeight = trimHeightIn * dpi;

  // Add bleed
  const fullWidth = trimWidth + bleedInches * 2 * dpi;
  const fullHeight = trimHeight + bleedInches * 2 * dpi;

  // Safe area inside trim
  const safeMargin = safeMarginInches * dpi;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Page with bleed */}
      <div
        className="relative bg-white shadow-lg"
        style={{ width: fullWidth, height: fullHeight }}
      >
        {/* Trim area (actual cut size) */}
        <div
          className="absolute bg-white"
          style={{
            top: bleedInches * dpi,
            left: bleedInches * dpi,
            width: trimWidth,
            height: trimHeight,
          }}
        >
          {/* Safe text area */}
          <div
            className="absolute overflow-hidden font-serif leading-relaxed"
            style={{
              top: safeMargin,
              left: safeMargin,
              right: safeMargin,
              bottom: safeMargin ,
            }}
          >
            {/* Debug guides */}
            {showGuides && (
              <>
                {/* Trim line */}
                <div className="absolute inset-0 border border-blue-100 pointer-events-none" />
                {/* Safe area */}
                <div className="absolute" style={{
                  top: 0, left: 0, right: 0, bottom: 0,
                  border: "1px dashed green",
                  pointerEvents: "none"
                }} />
              </>
            )}

            {/* First page only headings */}
            {section.type === "chapter" && section.pageIndex === 0 && (
              <h3 className="text-center text-sm font-semibold tracking-widest mb-6">
                CHAPTER {section.number ?? ""}
              </h3>
            )}
            {section.title && section.pageIndex === 0 && (
              <h2 className="text-2xl font-bold text-center mb-5 leading-snug">
                {section.title}
              </h2>
            )}

            {/* Chapter content */}
            <div
              className="text-justify leading-6"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
