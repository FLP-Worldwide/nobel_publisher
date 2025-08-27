"use client";
import React from "react";

export default function BlankPage({
  previewWidth = 600,         // screen width for preview
  bleedInches = 0.125,        // standard bleed per side
  showNote = false,           // show centered note
  note = "This page intentionally left blank.",
  showSafeBorder = false      // thin border around safe area
}) {
  // 5x8 trim
  const aspectRatio = 5 / 8;                 // width / height
  const previewHeight = previewWidth / aspectRatio;

  // scale bleed (bleed% of width)
  const bleedPercent = bleedInches / 5;      // bleed vs trim width
  const bleed = previewWidth * bleedPercent; // px

  return (
    <div className="flex justify-center items-center ">
      {/* Page (bleed area is gray) */}
      <div
        className="relative shadow-md rounded"
        style={{ width: previewWidth, height: previewHeight }}
      >
        {/* Safe (trim) area */}
        <div
          className="absolute overflow-hidden"
          style={{ top: bleed, left: bleed, right: bleed, bottom: bleed }}
        >
          {showSafeBorder && (
            <div className="absolute inset-0 border pointer-events-none" />
          )}

          {/* Blank center (optional note) */}
          {showNote && (
            <div className="w-full h-full flex items-center justify-center p-6">
              <p className="text-gray-500 italic text-sm text-center">
                {note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
