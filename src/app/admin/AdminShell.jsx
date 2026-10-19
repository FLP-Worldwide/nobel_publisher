"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [["/admin", "Book reviews"], ["/admin/orders", "Orders & shipping"], ["/admin/payments", "Payments"]];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  if (pathname === "/admin/login") return children;
  if (status === "loading") return <main className="ui-shell">Opening administration…</main>;
  if (session?.user?.role !== "admin") return <main className="ui-shell"><Link href="/admin/login">Sign in as an administrator</Link></main>;
  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div><Link href="/admin" className="text-lg font-bold text-blue-950">Nobel Books · Administration</Link><p className="mt-1 text-xs text-slate-500">Editorial review, fulfilment and collections</p></div>
        <div className="flex items-center gap-4 text-sm"><span>{session.user.name}</span><button className="rounded-lg border border-slate-300 px-3 py-2 font-semibold" onClick={() => signOut({ callbackUrl: "/admin/login" })}>Sign out</button></div>
      </div>
      <nav aria-label="Administration" className="mx-auto flex max-w-[1200px] flex-wrap gap-2 px-4 pb-4 sm:px-6">{links.map(([href, label]) => {
        const active = href === "/admin" ? pathname === href || pathname.startsWith("/admin/books/") : pathname.startsWith(href);
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`rounded-lg px-4 py-2 text-sm font-semibold ${active ? "bg-blue-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{label}</Link>;
      })}</nav>
    </header>
    {children}
  </div>;
}
