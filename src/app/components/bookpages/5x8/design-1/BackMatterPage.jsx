"use client";
import React from "react";

export default function BackMatterPage({
  section,
  trimWidthIn = 5,
  trimHeightIn = 8,
  dpi = 120,
  bleedInches = 0.125,
  safeMarginInches = 0.5, // add safe margin like ChapterPage
  showGuides = false,
}) {
  // Convert trim size to px
  const trimWidth = trimWidthIn * dpi;
  const trimHeight = trimHeightIn * dpi;

  // Add bleed
  const fullWidth = trimWidth + bleedInches * 2 * dpi;
  const fullHeight = trimHeight + bleedInches * 2 * dpi;

  // Safe area
  const safeMargin = safeMarginInches * dpi;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Page with bleed */}
      <div
        className="relative bg-white font-serif shadow-lg"
        style={{ width: fullWidth, height: fullHeight }}
      >
        {/* Trim area */}
        <div
          className="absolute bg-white"
          style={{
            top: bleedInches * dpi,
            left: bleedInches * dpi,
            width: trimWidth,
            height: trimHeight,
          }}
        >
          {/* Safe area inside trim */}
          <div
            className="absolute overflow-hidden leading-relaxed"
            style={{
              top: safeMargin,
              left: safeMargin,
              right: safeMargin,
              bottom: safeMargin,
            }}
          >
            {/* Debug guides */}
            {showGuides && (
              <>
                {/* Trim guide */}
                <div className="absolute inset-0 border border-blue-100 pointer-events-none" />
                {/* Safe margin guide */}
                <div
                  className="absolute"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: "1px dashed green",
                    pointerEvents: "none",
                  }}
                />
              </>
            )}

            {/* Title only on first page */}
            {section.title && section.pageIndex === 0 && (
              <h2 className="text-xl font-bold mb-4 text-center">
                {section.title}
              </h2>
            )}

            {/* Content */}
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
