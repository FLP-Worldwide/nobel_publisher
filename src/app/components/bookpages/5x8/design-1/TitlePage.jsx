"use client";
import React from "react";

export default function TitlePage({ title, subtitle, author }) {
  return (
    <div className="flex flex-col justify-center items-center px-16 h-full text-center">
      <h1 className="text-5xl font-extrabold mb-2">{title}</h1>
      <h2 className="text-lg italic mb-8">{subtitle}</h2>
      <p className="mt-25 text-xl font-bold">{author}</p>
    </div>
  );
}
