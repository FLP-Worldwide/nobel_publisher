"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserDropdown from "./UserDropdown";
import CartDropdown from "./CartDropdown";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-7">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" className="h-10 w-auto sm:h-12" alt="Nobel Books" />
          </Link>
          <ul className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
            <li>
              <Link href="/bookstore" className="hover:text-blue-700">Bookstore</Link>
            </li>
            <li>
              <Link href={session?.user?.role === "buyer" ? "/account" : "/write/tool"} className="hover:text-blue-700">{session?.user?.role === "buyer" ? "My account" : "Write a book"}</Link>
            </li>
            <li>
              <Link href={session?.user?.role === "buyer" ? "/account" : "/author-dashboard"} className="hover:text-blue-700">{session?.user?.role === "buyer" ? "My orders" : "My books"}</Link>
            </li>
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <CartDropdown />
          <UserDropdown />
        </div>
      </div>
    </nav>
  );
}
