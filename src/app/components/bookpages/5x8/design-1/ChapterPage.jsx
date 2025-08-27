"use client";
import React from "react";

export default function ChapterPage({
  chapter,
  previewWidth = 600,
  bleedInches = 0.125,
  showSafeBorder = false
}) {
  // Trim 5x8
  const aspectRatio = 5 / 8;
  const previewHeight = previewWidth / aspectRatio;

  // Bleed calculation
  const bleedPercent = bleedInches / 5;
  const bleed = previewWidth * bleedPercent;

  return (
    <div className="flex justify-center items-center min-h-screen ">
      {/* Page container with bleed */}
      <div
        className="relative  rounded"
        style={{ width: previewWidth, height: previewHeight }}
      >
        {/* Safe printable area */}
        <div
          className="absolute bg-white font-serif leading-relaxed overflow-hidden"
          style={{ top: bleed, left: bleed, right: bleed, bottom: bleed }}
        >
          {showSafeBorder && (
            <div className="absolute inset-0 border border-red-300 pointer-events-none" />
          )}

          {/* Chapter Layout */}
          <div className="px-10 py-14">
            {/* Chapter number */}
            <h3 className="text-center text-sm font-semibold tracking-widest mb-6">
              CHAPTER {chapter.number}
            </h3>

            {/* Chapter title */}
            <h2 className="text-2xl font-bold text-center mb-5 leading-snug">
              {chapter.title}
            </h2>

            {/* Chapter content */}
            <div
              className="text-justify leading-6"
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
