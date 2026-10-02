import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/bookstore", label: "Bookstore" },
  { href: "/author-dashboard", label: "Author dashboard" },
  { href: "/login", label: "Sign in" },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <Link href="/" className="inline-flex rounded-lg bg-white p-2">
            <Image src="/logo.png" width={104} height={52} alt="Nobel Books" className="h-10 w-auto" />
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
            A guided self-publishing workspace for authors to write, preview, submit for editorial review, publish, and order author copies.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-slate-800 px-5 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Nobel Books. Author manuscripts remain private until publication.
      </div>
    </footer>
  );
}
