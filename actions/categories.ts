// actions/categories.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { slugify_safe } from "@/lib/utils";

interface CategoryPayload {
  id?: number;
  name: string;
  slug?: string;
  parentId?: number | null;
  description?: string;
  imageUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

function parseCategoryInput(input: FormData | CategoryPayload): CategoryPayload {
  if (input instanceof FormData) {
    const idStr = input.get("id") as string | null;
    const name = (input.get("name") as string)?.trim() || "";
    const rawSlug = (input.get("slug") as string)?.trim();
    const slug = rawSlug || slugify_safe(name);
    const parentIdStr = input.get("parentId") as string | null;
    const description = ((input.get("description") as string) || "").trim();
    const rawImageUrl = input.get("imageUrl") as string | null;
    const imageUrl = rawImageUrl?.trim() ? rawImageUrl.trim() : null;
    const displayOrderStr = input.get("displayOrder") as string | null;
    const isActiveRaw = input.get("isActive");
    const isActive =
      isActiveRaw === "on" ||
      isActiveRaw === "true" ||
      isActiveRaw === "1";

    const parentId = parentIdStr && parentIdStr !== "" ? parseInt(parentIdStr, 10) : null;
    const displayOrder = displayOrderStr ? parseInt(displayOrderStr, 10) : 0;
    const id = idStr ? parseInt(idStr, 10) : undefined;

    return {
      id,
      name,
      slug,
      parentId: isNaN(parentId as number) ? null : parentId,
      description,
      imageUrl,
      displayOrder: isNaN(displayOrder) ? 0 : displayOrder,
      isActive,
    };
  }

  return {
    id: input.id,
    name: input.name?.trim() || "",
    slug: input.slug?.trim() || slugify_safe(input.name || ""),
    parentId: input.parentId ?? null,
    description: (input.description || "").trim(),
    imageUrl: input.imageUrl?.trim() ? input.imageUrl.trim() : null,
    displayOrder: typeof input.displayOrder === "number" ? input.displayOrder : 0,
    isActive: input.isActive ?? true,
  };
}

/**
 * Server Action to create a new category
 */
export async function createCategory(input: FormData | CategoryPayload) {
  const parsed = parseCategoryInput(input);

  if (!parsed.name) {
    return { error: "Category name is required" };
  }

  try {
    // Check if slug is unique
    const existing = await prisma.category.findUnique({
      where: { slug: parsed.slug },
    });

    if (existing) {
      return { error: "A category with this URL slug already exists." };
    }

    const created = await prisma.category.create({
      data: {
        name: parsed.name,
        slug: parsed.slug || slugify_safe(parsed.name),
        parentId: parsed.parentId,
        description: parsed.description || "",
        imageUrl: parsed.imageUrl,
        displayOrder: parsed.displayOrder || 0,
        isActive: parsed.isActive ?? true,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, category: created };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { error: error?.message || "Failed to save category." };
  }
}

/**
 * Server Action to update an existing category
 */
export async function updateCategory(input: FormData | CategoryPayload) {
  const parsed = parseCategoryInput(input);

  if (!parsed.id) {
    return { error: "Category ID is required for updates" };
  }

  if (!parsed.name) {
    return { error: "Category name is required" };
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { id: parsed.id },
    });

    if (!existing) {
      return { error: "Category not found." };
    }

    // If slug changed, ensure no collision with another category
    if (parsed.slug && parsed.slug !== existing.slug) {
      const slugCollision = await prisma.category.findUnique({
        where: { slug: parsed.slug },
      });
      if (slugCollision && slugCollision.id !== parsed.id) {
        return { error: "Another category with this URL slug already exists." };
      }
    }

    // Prevent category from being its own parent
    const safeParentId = parsed.parentId === parsed.id ? null : parsed.parentId;

    const updated = await prisma.category.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        slug: parsed.slug || existing.slug,
        parentId: safeParentId,
        description: parsed.description ?? existing.description,
        imageUrl: parsed.imageUrl,
        displayOrder: parsed.displayOrder ?? existing.displayOrder,
        isActive: parsed.isActive ?? existing.isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, category: updated };
  } catch (error: any) {
    console.error("Failed to update category:", error);
    return { error: error?.message || "Failed to update category." };
  }
}

/**
 * Server Action to delete a category
 */
export async function deleteCategory(formData: FormData) {
  const idStr = formData.get("id") as string;
  if (!idStr) return { error: "Category ID is required" };

  const id = parseInt(idStr, 10);

  try {
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { error: "Failed to delete category. Check if it contains associated products." };
  }
}
