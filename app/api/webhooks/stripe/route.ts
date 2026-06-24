// app/api/webhooks/stripe/route.ts
import Stripe from "stripe";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2022-11-15" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder"
    );
  } catch (err: any) {
    console.error("Stripe Webhook Signature Verification Failed:", err);
    return new Response(`Webhook signature invalid: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    
    if (orderId) {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
            stripePaymentId: session.payment_intent as string,
          },
        });
        console.log(`✅ Order ${orderId} marked as PAID/PROCESSING via Stripe Webhook`);
      } catch (err) {
        console.error(`Failed to update order ${orderId} on stripe webhook:`, err);
        return new Response("Database update failed", { status: 500 });
      }
    }
  }

  return new Response("ok", { status: 200 });
}
