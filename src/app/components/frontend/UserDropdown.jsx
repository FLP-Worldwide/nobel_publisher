import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function UserDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const formatName = (user) => {
    if (user?.name) {
      return user.name
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return user?.email || "";
  };
  

  if (!session) {
    return (
      <Link
        href="/login"
        className="text-blue-900  hover:underline"
      >
        Login / Signup
      </Link>
    );
  }

  return (
    <div className="relative inline-block text-left">
      {/* Greeting with Dropdown Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700  text-sm font-medium leading-none text-gray-900 "
      >
        Hi, {formatName(session.user)}
        <svg
          className="w-4 h-4"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 9-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg dark:bg-gray-700 z-20">
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-300">
            Account
          </div>
          <ul className="p-2 text-sm font-medium text-gray-900 ">
            {session.user?.role === "admin" && (
              <li>
                <Link href="/admin" className="block rounded-md px-3 py-2 font-semibold text-blue-800 hover:bg-blue-50">
                  Administration
                </Link>
              </li>
            )}
            <li>
              <Link
                href={session.user?.role === "admin" ? "/admin" : session.user?.role === "buyer" ? "/account" : "/author-dashboard"}
                className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Dashboard
              </Link>
            </li>
            {session.user?.role === "author" && <li>
              <Link
                href="/author-dashboard/update"
                className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Update Details
              </Link>
            </li>}
            <li>
              <Link
                href={session.user?.role === "admin" ? "/admin/orders" : session.user?.role === "buyer" ? "/account" : "/author-dashboard/order"}
                className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {session.user?.role === "admin" ? "Orders & shipping" : "My Orders"}
              </Link>
            </li>
          </ul>
          <div className="p-2 border-t border-gray-100 dark:border-gray-600">
            <button
              onClick={() => signOut({ callbackUrl: session.user?.role === "admin" ? "/admin/login" : "/login" })}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
