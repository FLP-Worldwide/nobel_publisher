"use client"
import React, { useState } from "react";

export default function AuthorSidebar({ currentStep }) {
  const [open, setOpen] = useState(false);

  const steps = [
    { id: "information", label: "Book Information" },
    { id: "content", label: "Book Content Design" },
    { id: "pricing", label: "Distribution & Pricing" },
    { id: "metadata", label: "Blurb and Metadata" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden p-3 m-2 rounded-md bg-blue-600 text-white"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕ Close" : "☰ Menu"}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-blue-100  
        transform ${open ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Back to Dashboard */}
          <div className="py-4 px-4">
            <a href="/author-dashboard">
              <button className="w-full flex items-center text-dark">
                ← Back to Dashboard
              </button>
            </a>
          </div>

          {/* Steps Menu */}
          <ul className="flex-1 p-4 space-y-2 font-medium">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              return (
                <li key={step.id}>
                  <button
                    disabled={!isActive}
                    className={`w-full flex items-center px-4 py-2 rounded-lg text-left transition
                      ${
                        isActive
                          ? "bg-blue-600 text-white cursor-pointer"
                          : "bg-gray-200 text-gray-600 cursor-not-allowed"
                      }
                    `}
                  >
                    {step.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
