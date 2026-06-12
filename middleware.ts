import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Guards /admin (redirect to login) and /api/admin (401 JSON). The login page
// itself is excluded so unauthenticated users can reach it.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const isProtected =
    (pathname.startsWith("/admin") && !isLogin) ||
    pathname.startsWith("/api/admin");

  if (!isProtected) return NextResponse.next();
  if (req.auth?.user) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL("/admin/login", req.nextUrl.origin);
  url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
