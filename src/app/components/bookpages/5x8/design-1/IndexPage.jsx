"use client";
import React from "react";

export default function IndexPage({
  previewWidth = 600,         // screen width for preview
  bleedInches = 0.125,        // standard bleed per side
  showSafeBorder = false,     // thin border around safe area
  chapters = [],              // array of { title, page }
  heading = "Contents"        // heading text
}) {
  // 5x8 trim
  const aspectRatio = 5 / 8;                 // width / height
  const previewHeight = previewWidth / aspectRatio;

  // scale bleed (bleed% of width)
  const bleedPercent = bleedInches / 5;      // bleed vs trim width
  const bleed = previewWidth * bleedPercent; // px

  return (
    <div className="flex justify-center items-center ">
      {/* Page */}
      <div
        className="relative shadow-md bg-white"
        style={{ width: previewWidth, height: previewHeight }}
      >
        {/* Safe (trim) area */}
        <div
          className="absolute overflow-hidden bg-white"
          style={{ top: bleed, left: bleed, right: bleed, bottom: bleed }}
        >
          {showSafeBorder && (
            <div className="absolute inset-0 border pointer-events-none" />
          )}

          {/* Index Content */}
          <div className="flex flex-col h-full p-10">
            {/* Heading */}
            <h2 className="text-xl font-bold text-center mb-8">
              {heading}
            </h2>

            {/* Chapters list */}
            <div className="flex-1 space-y-2">
              {chapters.map((ch, i) => (
                <div key={i} className="flex justify-between text-lg leading-relaxed">
                  <span className="truncate font-serif text-sm">{ch.title}</span>
                  <span className="ml-4 text-sm">{ch.page}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
