// proxy.ts
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAdminApiRoute = nextUrl.pathname.startsWith("/api/admin");
  const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

  // Redirect authenticated users trying to hit auth pages (login/register) to home
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect admin panel and admin api routes
  if (isAdminRoute || isAdminApiRoute) {
    if (!isLoggedIn) {
      // Redirect to login
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      // Forbidden, redirect to home page
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login", "/register"],
};
