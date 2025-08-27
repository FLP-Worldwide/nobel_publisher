"use client";
import React from "react";

export default function CopyrightPage({ copyright }) {
  return (
    <div className="flex flex-col justify-center items-center h-[800px] py-12 px-16 text-justify leading-relaxed text-lg ">
      <h3 className="font-bold mb-2 text-center text-sm">
      Copyright © Nobel Publishing House
      </h3>
      <h3 className="font-bold mb-2 text-center text-sm">All Rights Reserved</h3>
      <p className="text-sm text-justify">{copyright}</p>
      <p className="text-sm mt-2">Made with ❤ on the Nobel Books Platform</p>
      <span className="text-sm">www.nobelbooks.com</span>
    </div>
  );
}
