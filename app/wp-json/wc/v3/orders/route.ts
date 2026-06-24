// app/wp-json/wc/v3/orders/route.ts
import { NextResponse } from "next/server";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcOrder } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wc/v3/orders
 */
export async function GET(req: Request) {
  const authResult = await wcAuthenticate(req, "read");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "10");
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
      // Map WC status to DB status
      let dbStatus = undefined;
      switch (status) {
        case "pending":
          dbStatus = "PENDING";
          break;
        case "processing":
          dbStatus = "PROCESSING";
          break;
        case "on-hold":
          dbStatus = "SHIPPED"; // SHIPPED maps to on-hold
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
        where.status = dbStatus;
      }
    }

    const skip = (page - 1) * perPage;
    const take = perPage;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);
    const formatted = orders.map(formatWcOrder);

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-WP-Total": String(totalCount),
        "X-WP-TotalPages": String(totalPages),
      },
    });
  } catch (error) {
    console.error("WC Orders GET error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to fetch orders." }, { status: 500 });
  }
}

/**
 * POST /wp-json/wc/v3/orders
 */
export async function POST(req: Request) {
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const body = await req.json();

    const billing = body.billing || {};
    const shipping = body.shipping || {};
    const lineItems = body.line_items || [];

    if (lineItems.length === 0) {
      return NextResponse.json({ code: "rest_invalid_param", message: "Line items cannot be empty." }, { status: 400 });
    }

    // Generate order number
    const totalCount = await prisma.order.count();
    const orderNumber = `BD-${new Date().getFullYear()}-${String(totalCount + 1).padStart(4, "0")}`;

    // Map billing/shipping
    const billingAddress = {
      name: `${billing.first_name || ""} ${billing.last_name || ""}`.trim() || "Guest Customer",
      email: billing.email || "",
      phone: billing.phone || "",
      address: billing.address_1 || "",
      city: billing.city || "",
      state: billing.state || "",
      zip: billing.postcode || "",
      country: billing.country || "Pakistan",
    };

    const shippingAddress = {
      name: `${shipping.first_name || ""} ${shipping.last_name || ""}`.trim() || billingAddress.name,
      email: billingAddress.email,
      phone: shipping.phone || billingAddress.phone,
      address: shipping.address_1 || billingAddress.address,
      city: shipping.city || billingAddress.city,
      state: shipping.state || billingAddress.state,
      zip: shipping.postcode || billingAddress.zip,
      country: shipping.country || billingAddress.country,
    };

    // Calculate prices
    let subtotal = 0;
    const itemsData = [];

    for (const item of lineItems) {
      const productId = parseInt(item.product_id);
      if (isNaN(productId)) continue;

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ code: "rest_product_invalid", message: `Product ID ${productId} not found.` }, { status: 400 });
      }

      const qty = item.quantity || 1;
      const price = item.price ? Number(item.price) : Number(product.salePrice || product.regularPrice);
      const totalItem = price * qty;
      subtotal += totalItem;

      itemsData.push({
        productId,
        name: product.name,
        quantity: qty,
        price,
        total: totalItem,
        imageUrl: (typeof product.images === "string" ? JSON.parse(product.images) : product.images)?.[0]?.src || null,
      });
    }

    const shippingCost = body.shipping_lines?.[0]?.total ? Number(body.shipping_lines[0].total) : 0;
    const discount = body.discount_total ? Number(body.discount_total) : 0;
    const total = subtotal + shippingCost - discount;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: body.payment_method || "cod",
        currency: body.currency || "PKR",
        subtotal,
        discount,
        shippingCost,
        tax: 0,
        total,
        notes: body.customer_note || "",
        billingAddress,
        shippingAddress,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(formatWcOrder(order), { status: 201 });
  } catch (error) {
    console.error("WC Orders POST error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to create order." }, { status: 500 });
  }
}
