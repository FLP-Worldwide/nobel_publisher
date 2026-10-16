import Link from "next/link";

export const metadata = {
  title: "Review desk | Nobel Books",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/admin" className="text-lg font-bold tracking-tight text-blue-950">
              Nobel Books · Review desk
            </Link>
            <p className="text-xs text-slate-500">Editorial review and publishing approval</p>
          </div>
          <Link href="/admin/orders" className="text-sm font-semibold underline">Paid orders</Link>
          <Link
            href="/author-dashboard"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Author dashboard
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
