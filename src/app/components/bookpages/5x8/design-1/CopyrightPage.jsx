"use client";
import React from "react";

export default function CopyrightPage({
  copyright,
  trimWidthIn = 5,
  trimHeightIn = 8,
  dpi = 120,
  bleedInches = 0.125,
  safeMarginInches = 0.5, // add safe margin like other pages
  showGuides = false,
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
          {/* Safe area inside trim */}
          <div
            className="absolute flex flex-col items-center justify-center text-justify text-sm leading-relaxed"
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

            {/* Copyright Content */}
            <h3 className="font-bold mb-2 text-center">
              Copyright © Nobel Publishing House
            </h3>
            <h3 className="font-bold mb-2 text-center">All Rights Reserved</h3>
            <p>{copyright}</p>
            <p className="mt-2">Made with ❤ on the Nobel Books Platform</p>
            <span>www.nobelbooks.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
