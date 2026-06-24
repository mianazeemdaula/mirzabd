// actions/categories.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { slugify_safe } from "@/lib/utils";

/**
 * Server Action to create a new category
 */
export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string || slugify_safe(name);
  const parentIdStr = formData.get("parentId") as string;
  const description = formData.get("description") as string || "";
  const imageUrl = formData.get("imageUrl") as string || null;
  const displayOrderStr = formData.get("displayOrder") as string;
  const isActive = formData.get("isActive") === "on";

  if (!name) {
    throw new Error("Category name is required");
  }

  const parentId = parentIdStr ? parseInt(parentIdStr) : null;
  const displayOrder = displayOrderStr ? parseInt(displayOrderStr) : 0;

  try {
    // Check if slug is unique
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error("A category with this slug already exists.");
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        parentId: isNaN(parentId as number) ? null : parentId,
        description,
        imageUrl,
        displayOrder: isNaN(displayOrder) ? 0 : displayOrder,
        isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Failed to create category:", error);
    throw new Error(error.message || "Failed to save category.");
  }
}

/**
 * Server Action to delete a category
 */
export async function deleteCategory(formData: FormData) {
  const idStr = formData.get("id") as string;
  if (!idStr) throw new Error("Category ID is required");

  const id = parseInt(idStr);

  try {
    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw new Error("Failed to delete category. Check if it contains books.");
  }
}
