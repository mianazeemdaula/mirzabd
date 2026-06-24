// actions/books.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { slugify_safe } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import Decimal = Prisma.Decimal;

/**
 * Server Action to delete a book from the catalog
 */
export async function deleteBook(formData: FormData) {
  const idStr = formData.get("id") as string;
  if (!idStr) throw new Error("Product ID is required");

  const id = parseInt(idStr);

  try {
    // Delete the product (will cascade delete variations)
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/books");
    revalidatePath("/books");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete book:", error);
    throw new Error("Failed to delete book. Please check for active orders.");
  }
}

/**
 * Server Action to toggle the isFeatured status of a book
 */
export async function toggleFeatured(id: number, currentFeatured: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isFeatured: !currentFeatured },
    });

    revalidatePath("/admin/books");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to toggle featured status:", error);
    throw new Error("Failed to update status.");
  }
}

/**
 * Server Action to create a book (from JSON payload)
 */
export async function createBook(values: any) {
  try {
    const slug = values.slug || slugify_safe(values.name);
    
    // Check if slug is unique
    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error("A book with this slug already exists.");
    }

    const { categoryIds, tagIds, images, attributes, ...rest } = values;

    // Create product
    const product = await prisma.product.create({
      data: {
        ...rest,
        slug,
        regularPrice: new Decimal(values.regularPrice || 0),
        salePrice: values.salePrice ? new Decimal(values.salePrice) : null,
        weight: values.weight ? new Decimal(values.weight) : null,
        images: images || [],
        attributes: attributes || [],
        categories: {
          connect: (categoryIds || []).map((id: number) => ({ id })),
        },
      },
    });

    revalidatePath("/admin/books");
    revalidatePath("/books");
    revalidatePath("/");

    return { success: true, id: product.id };
  } catch (error: any) {
    console.error("Failed to create book:", error);
    return { error: error.message || "Failed to create book." };
  }
}

/**
 * Server Action to update a book (from JSON payload)
 */
export async function updateBook(id: number, values: any) {
  try {
    const slug = values.slug || slugify_safe(values.name);
    
    // Check if slug is unique (excluding current book)
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (existing) {
      throw new Error("A book with this slug already exists.");
    }

    const { categoryIds, tagIds, images, attributes, ...rest } = values;

    // Disconnect existing categories and connect new ones
    await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        slug,
        regularPrice: new Decimal(values.regularPrice || 0),
        salePrice: values.salePrice ? new Decimal(values.salePrice) : null,
        weight: values.weight ? new Decimal(values.weight) : null,
        images: images || [],
        attributes: attributes || [],
        categories: {
          set: [], // clear existing
          connect: (categoryIds || []).map((id: number) => ({ id })),
        },
      },
    });

    revalidatePath(`/admin/books/${id}`);
    revalidatePath("/admin/books");
    revalidatePath(`/books/${slug}`);
    revalidatePath("/books");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to update book:", error);
    return { error: error.message || "Failed to update book." };
  }
}
