"use client";
import React from "react";

export default function BlankPage({
  trimWidthIn = 5,
  trimHeightIn = 8,
  dpi = 120,
  bleedInches = 0.125,
  showNote = false,
  note = "This page intentionally left blank.",
  showSafeBorder = false,
}) {
  const previewWidth = trimWidthIn * dpi;
  const previewHeight = trimHeightIn * dpi;
  const bleed = bleedInches * dpi;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div
        className="relative bg-white shadow-md rounded"
        style={{ width: previewWidth, height: previewHeight }}
      >
        <div
          className="absolute overflow-hidden h-full"
          style={{ top: bleed, left: bleed, right: bleed, bottom: bleed }}
        >
          {showSafeBorder && (
            <div className="absolute inset-0 border border-red-300 pointer-events-none" />
          )}
          {showNote && (
            <div className="w-full h-full flex items-center justify-center p-6">
              <p className="text-gray-500 italic text-sm text-center">{note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
