// actions/reviews.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

/**
 * Server Action to toggle approval status of a book review
 */
export async function toggleReviewApproval(formData: FormData) {
  const reviewId = formData.get("reviewId") as string;
  const currentApproved = formData.get("currentApproved") === "true";

  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  try {
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        isApproved: !currentApproved,
      },
    });

    // Recalculate average ratings for the product in background
    const ratingAggregate = await prisma.review.aggregate({
      where: { productId: updated.productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: updated.productId },
      data: {
        averageRating: ratingAggregate._avg.rating || 0,
        ratingCount: ratingAggregate._count.rating || 0,
      },
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/products");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to toggle review approval:", error);
    throw new Error("Failed to toggle approval status.");
  }
}

/**
 * Server Action to delete a review from the database
 */
export async function deleteReview(formData: FormData) {
  const reviewId = formData.get("reviewId") as string;

  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  try {
    const deleted = await prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate average ratings for the product
    const ratingAggregate = await prisma.review.aggregate({
      where: { productId: deleted.productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: deleted.productId },
      data: {
        averageRating: ratingAggregate._avg.rating || 0,
        ratingCount: ratingAggregate._count.rating || 0,
      },
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/products");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete review:", error);
    throw new Error("Failed to delete review.");
  }
}
