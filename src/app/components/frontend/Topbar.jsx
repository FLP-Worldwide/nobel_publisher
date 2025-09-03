"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Topbar() {
  // const { data: session } = useSession();

  return (
    <nav className="bg-white  border-b border-gray-200 ">
      <div className="flex justify-between items-center max-w-full mx-auto px-8 py-2 text-sm">
        {/* Left */}
        <Link href="#" className="text-gray-500 -white hover:underline">
          Support
        </Link>
     
         <Link
            href="#"
            className="text-blue-900 -white hover:underline "
          >
            Request Callback
          </Link>
      </div>
    </nav>
  );
}
