import React, { useState } from "react";
import { ShoppingCart, ChevronDown, X } from "lucide-react";

export default function CartDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Cart Button */}
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className="inline-flex items-center rounded-lg justify-center p-2 hover:bg-gray-100  text-sm font-medium leading-none text-gray-900 "
      >
        <span className="sr-only">Cart</span>

        {/* Cart Icon */}
        <ShoppingCart className="w-5 h-5 lg:me-1" />

        <span className="hidden sm:flex">My Cart</span>

        {/* Dropdown Arrow */}
        <ChevronDown className="hidden sm:flex w-4 h-4 ms-1" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-64 z-10 space-y-4 overflow-hidden rounded-lg bg-white p-4 antialiased shadow-lg "
        >
          <div className="grid grid-cols-2">
            <div>
              <a
                href="#"
                className="truncate text-sm font-semibold leading-none text-gray-900  hover:underline"
              >
                Apple iPhone 15
              </a>
              <p className="mt-0.5 truncate text-sm font-normal text-gray-500 ">
                $599
              </p>
            </div>

            <div className="flex items-center justify-end gap-6">
              <p className="text-sm font-normal leading-none text-gray-500 ">
                Qty: 1
              </p>

              {/* Remove Button */}
              <button
                type="button"
                className="text-red-600 hover:text-red-700  "
              >
                <span className="sr-only"> Remove </span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Checkout Button */}
          <a
            href="/checkout"
            className="mb-2 me-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            role="button"
          >
            Proceed to Checkout
          </a>
        </div>
      )}
    </div>
  );
}
