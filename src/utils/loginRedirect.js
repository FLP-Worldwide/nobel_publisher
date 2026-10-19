export function loginDestination(role, callbackUrl) {
  const fallback = role === "buyer" ? "/account" : role === "admin" ? "/admin" : "/author-dashboard";
  if (typeof callbackUrl !== "string" || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//") || /[\\\u0000-\u0020]/.test(callbackUrl)) return fallback;
  // Auth pages are not useful return destinations and can create redirect loops.
  const pathname = callbackUrl.split(/[?#]/)[0];
  if (["/login", "/buyer/login", "/login/create", "/buyer/signup", "/admin/login"].includes(pathname)) return fallback;
  if (role === "admin" && pathname !== "/admin" && !pathname.startsWith("/admin/")) return fallback;
  if (role !== "admin" && (pathname === "/admin" || pathname.startsWith("/admin/"))) return fallback;
  return callbackUrl;
}
