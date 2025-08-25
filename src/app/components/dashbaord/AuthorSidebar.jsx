import React from "react";

export default function AuthorSidebar({ currentStep = "information" }) {
  const steps = [
    { id: "information", label: "Book Information" },
    { id: "content", label: "Book Content Design" },
    { id: "pricing", label: "Distribution & Pricing" },
    { id: "distribution", label: "Blurb and Metadata" },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-blue-100 dark:bg-blu-100 ">
      <div className="h-full flex flex-col">
        
     {/* Back to Dashboard */}
        <div className="py-4 px-4">
          <button className="w-full flex items-center  text-dark">
            ← Back to Dashboard
          </button>
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
  );
}
