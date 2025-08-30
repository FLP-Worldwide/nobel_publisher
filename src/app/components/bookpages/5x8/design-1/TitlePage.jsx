"use client";
import React from "react";

export default function TitlePage({
  title,
  subtitle,
  author,
  trimWidthIn = 5,
  trimHeightIn = 8,
  dpi = 120,
  bleedInches = 0.125,
  safeMarginInches = 0.5, // added safe margin
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
        className="relative bg-white shadow-lg font-serif"
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
          {/* Safe text/content area */}
          <div
            className="absolute flex flex-col items-center justify-center text-center"
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

            {/* Title Page Content */}
            <h1 className="text-5xl font-extrabold mb-2">{title}</h1>
            {subtitle && (
              <h2 className="text-lg italic mb-8">{subtitle}</h2>
            )}
            {author && (
              <p className="mt-6 text-xl font-bold">{author}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
