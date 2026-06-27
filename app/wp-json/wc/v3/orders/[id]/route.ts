// app/wp-json/wc/v3/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { withWcLogging } from "@/lib/logger";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcOrder } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wc/v3/orders/[id]
 */
async function GETHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "read");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(formatWcOrder(order));
  } catch (error) {
    console.error("WC Single Order GET error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to fetch order." }, { status: 500 });
  }
}

/**
 * PUT /wp-json/wc/v3/orders/[id]
 */
async function PUTHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Order not found." }, { status: 404 });
    }

    const updateData: any = {};

    if (body.status !== undefined) {
      // Map WC status back to database OrderStatus
      let dbStatus = undefined;
      switch (body.status) {
        case "pending":
          dbStatus = "PENDING";
          break;
        case "processing":
          dbStatus = "PROCESSING";
          break;
        case "on-hold":
          dbStatus = "SHIPPED";
          break;
        case "completed":
          dbStatus = "DELIVERED";
          break;
        case "cancelled":
          dbStatus = "CANCELLED";
          break;
        case "refunded":
          dbStatus = "REFUNDED";
          break;
      }
      if (dbStatus) {
        updateData.status = dbStatus;
      }
    }

    if (body.customer_note !== undefined) {
      updateData.notes = body.customer_note;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
      },
    });

    return NextResponse.json(formatWcOrder(updated));
  } catch (error) {
    console.error("WC Single Order PUT error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to update order." }, { status: 500 });
  }
}

/**
 * DELETE /wp-json/wc/v3/orders/[id]
 */
async function DELETEHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;

    const existing = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Order not found." }, { status: 404 });
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json(formatWcOrder(existing));
  } catch (error) {
    console.error("WC Single Order DELETE error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to delete order." }, { status: 500 });
  }
}

export const GET = withWcLogging(GETHandler);
export const PUT = withWcLogging(PUTHandler);
export const DELETE = withWcLogging(DELETEHandler);
