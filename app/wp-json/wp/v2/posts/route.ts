// app/wp-json/wp/v2/posts/route.ts
import { NextResponse } from "next/server";
import { withWcLogging } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wp/v2/posts
 * Mock WordPress posts endpoint for discovery checks made by Desktop POS systems.
 * Returns an empty list of posts.
 */
export const GET = withWcLogging(async (req: Request) => {
  return NextResponse.json([]);
});
