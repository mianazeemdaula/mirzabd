// app/api/admin/logs/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const LOGS_FILE = path.join(process.cwd(), "logs", "requests.json");

/**
 * GET: Retrieve list of WooCommerce API request logs.
 * Protected: Admin only.
 */
export async function GET(req: Request) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session || userRole !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const method = searchParams.get("method");
    const pathSearch = searchParams.get("path");
    const search = searchParams.get("search");

    let requestLogs: any[] = [];
    if (fs.existsSync(LOGS_FILE)) {
      const fileContent = fs.readFileSync(LOGS_FILE, "utf-8").trim();
      if (fileContent) {
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          requestLogs = parsed;
        }
      }
    }

    // Reverse to show latest first
    let filtered = [...requestLogs].reverse();

    if (method) {
      filtered = filtered.filter(
        (log) => log.method?.toUpperCase() === method.toUpperCase()
      );
    }
    if (pathSearch) {
      filtered = filtered.filter(
        (log) => log.path?.toLowerCase().includes(pathSearch.toLowerCase())
      );
    }
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((log) => {
        const bodyString =
          typeof log.body === "object"
            ? JSON.stringify(log.body)
            : String(log.body || "");
        const headersString = JSON.stringify(log.headers);
        const queryString = JSON.stringify(log.query);
        return (
          log.path?.toLowerCase().includes(query) ||
          bodyString.toLowerCase().includes(query) ||
          headersString.toLowerCase().includes(query) ||
          queryString.toLowerCase().includes(query)
        );
      });
    }

    return NextResponse.json(filtered.slice(0, limit));
  } catch (error) {
    console.error("Failed to read API logs:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Clear WooCommerce API request logs.
 * Protected: Admin only.
 */
export async function DELETE() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session || userRole !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const dir = path.dirname(LOGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOGS_FILE, "[]", "utf-8");
    return NextResponse.json({ success: true, message: "Logs successfully cleared" });
  } catch (error) {
    console.error("Failed to clear API logs:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
