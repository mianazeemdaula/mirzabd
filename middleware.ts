// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import proxy from "./proxy";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Clean malformed WooCommerce API paths (e.g. containing /wp-json/)
  // Look for '/wp-json/' anywhere in the path (e.g. /%0Abase%20url/wp-json/wc/v3/products)
  const wpJsonIndex = pathname.indexOf("/wp-json/");
  if (wpJsonIndex > -1) {
    const cleanPath = pathname.substring(wpJsonIndex);
    const url = req.nextUrl.clone();
    url.pathname = cleanPath;
    
    // Rewrite internally so Next.js routes to the clean API endpoint
    return NextResponse.rewrite(url);
  }

  // 2. Protect Admin & Auth Routes using the existing proxy middleware
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAdminRoute || isAdminApiRoute || isAuthPage) {
    // Run the proxy middleware (NextAuth wrapper)
    return proxy(req as any, {} as any);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except static assets & metadata
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
