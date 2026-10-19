// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Auth pages
const authPages = ["/login", "/login/create", "/buyer/login", "/buyer/signup", "/admin/login"];
const redirectAfterAuth = "/author-dashboard";

// Protected pages (must be logged in)
const protectedRoutes = [
  "/author-dashboard",
  "/write",
  "/admin",
  "/dashboard",
  "/account",
  "/orders",
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Get token (check if user is logged in)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // Match the HTTPS cookie issued by NextAuth even when NEXTAUTH_URL was
    // configured as a hostname without a scheme. HTTP local development uses
    // the unprefixed cookie; HTTPS must never fall back to that cookie.
    secureCookie: req.nextUrl.protocol === "https:",
  });

  // 🔹 Case 1: Block logged-in users from login/signup
  if (authPages.includes(pathname) && token) {
    const url = req.nextUrl.clone();
    url.pathname = token.role === "buyer" ? "/account" : token.role === "admin" ? "/admin" : redirectAfterAuth;
    return NextResponse.redirect(url);
  }

  // 🔹 Case 2: Protect private routes
  if (protectedRoutes.some((route) => (pathname === route || pathname.startsWith(`${route}/`))) && pathname !== "/admin/login" && !token) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") ? "/admin/login" : pathname.startsWith("/account") || pathname.startsWith("/orders") ? "/buyer/login" : "/login";
    url.searchParams.set("callbackUrl", pathname); // return after login
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && token?.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = token?.role === "buyer" ? "/account" : "/author-dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (["buyer", "admin"].includes(token?.role) && (pathname.startsWith("/write") || pathname.startsWith("/author-dashboard"))) {
    const url = req.nextUrl.clone(); url.pathname = token.role === "admin" ? "/admin" : "/account"; url.search = ""; return NextResponse.redirect(url);
  }
  // Default → allow
  return NextResponse.next();
}

// Match both auth & protected pages
export const config = {
  matcher: [
    "/buyer/:path*",
    "/login",
    "/login/create",
    "/author-dashboard/:path*",
    "/write/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    "/orders/:path*",
  ],
};
