"use client";
import React from "react";

export default function BackMatterPage({
  backmatter,
  previewWidth = 600,      // screen width for preview
  bleedInches = 0.125,     // bleed margin (default 0.125in)
  showSafeBorder = false   // optional safe border highlight
}) {
  // 5x8 trim
  const aspectRatio = 5 / 8;               
  const previewHeight = previewWidth / aspectRatio;

  // scale bleed from trim width (5in)
  const bleedPercent = bleedInches / 5;    
  const bleed = previewWidth * bleedPercent;

  return (
    <div className="flex justify-center items-center min-h-screen">
      {/* Page container (gray = bleed area) */}
      <div
        className="relative  shadow-md rounded"
        style={{ width: previewWidth, height: previewHeight }}
      >
        {/* Safe printable area (white trim box) */}
        <div
          className="absolute bg-white leading-relaxed overflow-hidden"
          style={{ top: bleed, left: bleed, right: bleed, bottom: bleed }}
        >
          {showSafeBorder && (
            <div className="absolute inset-0 border border-red-300 pointer-events-none" />
          )}

          <div className="px-10 py-14">
            {/* Chapter number */}
            <h3 className="text-center text-2xl font-serif font-semibold  mb-5">
            Where Does It Come From?
            </h3>
            <p className="text-md text-justify font-serif leading-6">
              {backmatter}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
