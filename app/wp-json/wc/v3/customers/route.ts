// app/wp-json/wc/v3/customers/route.ts
import { NextResponse } from "next/server";
import { withWcLogging } from "@/lib/logger";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcCustomer } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wc/v3/customers
 */
async function GETHandler(req: Request) {
  const authResult = await wcAuthenticate(req, "read");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "10");
    const search = searchParams.get("search");

    const where: any = {
      role: "CUSTOMER",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * perPage;
    const take = perPage;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          addresses: true,
          orders: {
            select: { paymentStatus: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);
    const formatted = users.map(formatWcCustomer);

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-WP-Total": String(totalCount),
        "X-WP-TotalPages": String(totalPages),
      },
    });
  } catch (error) {
    console.error("WC Customers GET error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to fetch customers." }, { status: 500 });
  }
}

export const GET = withWcLogging(GETHandler);
