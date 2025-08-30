"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import UserDropdown from "./UserDropdown";
import CartDropdown from "./CartDropdown";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white  shadow-sm">
      <div className="flex items-center justify-between max-w-full mx-auto p-4 px-8">
        {/* Left: Logo + Menu */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" className="h-12" alt="Logo" />
          </Link>
          <ul className="hidden md:flex space-x-6 font-medium">
            <li>
              <Link
                href="/bookstore"
                className="text-gray-900 hover:text-blue-600 "
              >
                Collections
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-gray-900 hover:text-blue-600 "
              >
                Authors
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-gray-900 hover:text-blue-600 "
              >
                Genre
              </Link>
            </li>
          </ul>
        </div>

        {/* Center: Search */}
        <div className="flex-1 mx-8 max-w-lg hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by book name, Author name..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500  "
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 "
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
        </div>

        {/* Right: Request Call + User info + Logout */}
        <div className="flex items-center space-x-4">
         
          <CartDropdown />
          

          <UserDropdown/>

        </div>
      </div>
    </nav>
  );
}
