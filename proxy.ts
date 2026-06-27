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

  // 1. Clean malformed WooCommerce API paths (e.g. containing /wp-json/)
  // Look for '/wp-json/' anywhere in the path (e.g. /%0Abase%20url/wp-json/wc/v3/products)
  const { pathname } = req.nextUrl;
  const wpJsonIndex = pathname.indexOf("/wp-json/");
  if (wpJsonIndex > -1) {
    const cleanPath = pathname.substring(wpJsonIndex);
    const url = req.nextUrl.clone();
    url.pathname = cleanPath;
    
    // Rewrite internally so Next.js routes to the clean API endpoint
    return NextResponse.rewrite(url);
  }

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
