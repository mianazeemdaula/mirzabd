// app/api/store/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2022-11-15" as any, // pinned for compatibility
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const {
      email,
      phone,
      billing,
      shippingSameAsBilling,
      shipping,
      paymentMethod,
      notes,
      items,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Your shopping bag is empty." },
        { status: 400 }
      );
    }

    if (!billing || !billing.name || !billing.address || !billing.city) {
      return NextResponse.json(
        { message: "Billing details are incomplete." },
        { status: 400 }
      );
    }

    const shippingDetails = shippingSameAsBilling ? billing : shipping;
    if (!shippingDetails || !shippingDetails.name || !shippingDetails.address || !shippingDetails.city) {
      return NextResponse.json(
        { message: "Shipping details are incomplete." },
        { status: 400 }
      );
    }

    // Securely retrieve prices and calculate subtotal on server side
    const productIds = items.map((item: any) => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const orderItemsData = [];
    let subtotal = 0;

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { message: `Product "${item.name || item.productId}" was not found.` },
          { status: 400 }
        );
      }

      // Check stock
      if (dbProduct.manageStock && dbProduct.stockQuantity !== null) {
        if (dbProduct.stockQuantity < item.quantity) {
          return NextResponse.json(
            { message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stockQuantity} remaining.` },
            { status: 400 }
          );
        }
      }

      // Determine price (securely from DB)
      let price = dbProduct.salePrice ? Number(dbProduct.salePrice) : Number(dbProduct.regularPrice);

      // Handle variation price if applicable
      if (item.variationId) {
        const dbVariation = await prisma.variation.findUnique({
          where: { id: item.variationId },
        });
        if (dbVariation) {
          price = dbVariation.salePrice ? Number(dbVariation.salePrice) : Number(dbVariation.regularPrice);
        }
      }

      const totalItem = price * item.quantity;
      subtotal += totalItem;

      // Extract cover image
      let imageUrl = null;
      if (dbProduct.images) {
        try {
          const parsed = typeof dbProduct.images === "string" ? JSON.parse(dbProduct.images) : dbProduct.images;
          if (Array.isArray(parsed) && parsed.length > 0) {
            imageUrl = parsed[0].src;
          }
        } catch (e) {
          console.error(e);
        }
      }

      orderItemsData.push({
        productId: dbProduct.id,
        variationId: item.variationId || null,
        name: dbProduct.name,
        sku: dbProduct.sku || null,
        quantity: item.quantity,
        price,
        total: totalItem,
        imageUrl,
      });
    }

    const discount = 0; // extensible for discount coupons
    const shippingCost = 0; // free shipping
    const tax = 0;
    const total = subtotal - discount + shippingCost + tax;

    const orderNumber = generateOrderNumber();

    // Create the order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        guestEmail: session?.user ? null : email,
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod,
        currency: "PKR",
        subtotal,
        discount,
        shippingCost,
        tax,
        total,
        notes: notes || "",
        billingAddress: billing,
        shippingAddress: shippingDetails,
        items: {
          create: orderItemsData.map((oi) => ({
            productId: oi.productId,
            variationId: oi.variationId,
            name: oi.name,
            sku: oi.sku,
            quantity: oi.quantity,
            price: oi.price,
            total: oi.total,
            imageUrl: oi.imageUrl,
          })),
        },
      },
    });

    // Update stock quantities if managed
    for (const item of orderItemsData) {
      if (item.variationId) {
        const dbVariation = await prisma.variation.findUnique({
          where: { id: item.variationId },
        });
        if (dbVariation && dbVariation.stockQuantity !== null) {
          await prisma.variation.update({
            where: { id: item.variationId },
            data: {
              stockQuantity: Math.max(0, dbVariation.stockQuantity - item.quantity),
              stockStatus: dbVariation.stockQuantity - item.quantity <= 0 ? "outofstock" : "instock",
            },
          });
        }
      } else {
        const dbProduct = dbProducts.find((p) => p.id === item.productId);
        if (dbProduct && dbProduct.manageStock && dbProduct.stockQuantity !== null) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: Math.max(0, dbProduct.stockQuantity - item.quantity),
              stockStatus: dbProduct.stockQuantity - item.quantity <= 0 ? "outofstock" : "instock",
            },
          });
        }
      }
    }

    if (paymentMethod === "stripe") {
      // Create Stripe checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: orderItemsData.map((item) => ({
          price_data: {
            currency: "pkr",
            product_data: {
              name: item.name,
              images: item.imageUrl ? [item.imageUrl] : [],
            },
            unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents/paisas
          },
          quantity: item.quantity,
        })),
        metadata: {
          orderId: order.id,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order_id=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      });

      return NextResponse.json({ url: stripeSession.url });
    } else {
      // Cash on Delivery
      return NextResponse.json({ orderId: order.id });
    }
  } catch (error: any) {
    console.error("Checkout transaction error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while creating your order." },
      { status: 500 }
    );
  }
}
