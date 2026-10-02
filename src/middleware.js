// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Auth pages
const authPages = ["/login", "/login/create", "/buyer/login", "/buyer/signup"];
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
  });

  // 🔹 Case 1: Block logged-in users from login/signup
  if (authPages.includes(pathname) && token) {
    const url = req.nextUrl.clone();
    url.pathname = token.role === "buyer" ? "/account" : token.role === "admin" ? "/admin" : redirectAfterAuth;
    return NextResponse.redirect(url);
  }

  // 🔹 Case 2: Protect private routes
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith("/account") || pathname.startsWith("/orders") ? "/buyer/login" : "/login";
    url.searchParams.set("callbackUrl", pathname); // return after login
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && token?.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/author-dashboard";
    return NextResponse.redirect(url);
  }

  if (token?.role === "buyer" && (pathname.startsWith("/write") || pathname.startsWith("/author-dashboard"))) {
    const url = req.nextUrl.clone(); url.pathname = "/account"; url.search = ""; return NextResponse.redirect(url);
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
