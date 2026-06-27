// app/wp-json/wc/v3/customers/[id]/route.ts
import { NextResponse } from "next/server";
import { withWcLogging } from "@/lib/logger";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcCustomer } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wc/v3/customers/[id]
 */
async function GETHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "read");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          select: { paymentStatus: true },
        },
      },
    });

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json({ code: "rest_invalid_id", message: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json(formatWcCustomer(user));
  } catch (error) {
    console.error("WC Single Customer GET error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to fetch customer." }, { status: 500 });
  }
}

export const GET = withWcLogging(GETHandler);
