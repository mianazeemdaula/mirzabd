// actions/orders.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

/**
 * Server Action to update the shipping status of an order
 */
export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as OrderStatus;

  if (!orderId || !status) {
    throw new Error("Missing required fields");
  }

  try {
    // If status is DELIVERED, automatically mark paymentStatus as PAID if paymentMethod is COD
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const paymentStatusUpdate =
      status === "DELIVERED" && order?.paymentMethod === "cod" ? "PAID" : undefined;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        paymentStatus: paymentStatusUpdate,
      },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw new Error("Failed to update order status.");
  }
}

/**
 * Server Action to cancel an order
 */
export async function cancelOrder(formData: FormData) {
  const orderId = formData.get("orderId") as string;

  if (!orderId) {
    throw new Error("Order ID is required");
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
      },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
  } catch (error) {
    console.error("Failed to cancel order:", error);
    throw new Error("Failed to cancel order.");
  }
}
