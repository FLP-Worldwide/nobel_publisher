"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import OrderHistory from "@/app/components/OrderHistory";
export default function ReaderAccount() {
  const { data: session } = useSession();
  return <main className="ui-shell"><p className="ui-eyebrow">Nobel / Reader account</p><h1 className="mt-3 text-2xl font-semibold">Good to see you, {session?.user?.name || "reader"}.</h1><div className="my-6 flex gap-5"><Link className="ui-button" href="/bookstore">Explore the bookshop</Link><button onClick={() => signOut({ callbackUrl: "/buyer/login" })}>Sign out</button></div><h2 className="mb-5 mt-12 text-xl font-semibold">Your orders</h2><OrderHistory/></main>;
}
