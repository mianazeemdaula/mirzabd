// app/wp-json/wc/v3/products/categories/[id]/route.ts
import { NextResponse } from "next/server";
import { withWcLogging } from "@/lib/logger";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcCategory } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wc/v3/products/categories/[id]
 */
async function GETHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "read");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Invalid ID." }, { status: 404 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || !category.isActive) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Category not found." }, { status: 404 });
    }

    return NextResponse.json(formatWcCategory(category));
  } catch (error) {
    console.error("WC Single Category GET error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to fetch category." }, { status: 500 });
  }
}

/**
 * PUT /wp-json/wc/v3/products/categories/[id]
 */
async function PUTHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Invalid ID." }, { status: 404 });
    }

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existing || !existing.isActive) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Category not found." }, { status: 404 });
    }

    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    
    if (body.slug !== undefined) {
      const slug = body.slug;
      if (slug !== existing.slug) {
        const dup = await prisma.category.findUnique({ where: { slug } });
        if (dup) {
          return NextResponse.json({ code: "category_invalid_slug", message: "A category with this slug already exists." }, { status: 400 });
        }
      }
      updateData.slug = slug;
    }

    if (body.parent !== undefined) {
      const parentId = body.parent ? parseInt(body.parent) : null;
      updateData.parentId = parentId && !isNaN(parentId) ? parentId : null;
    }

    if (body.description !== undefined) updateData.description = body.description;
    if (body.image?.src !== undefined) updateData.imageUrl = body.image?.src;
    if (body.menu_order !== undefined) {
      const menuOrder = parseInt(body.menu_order);
      updateData.displayOrder = isNaN(menuOrder) ? 0 : menuOrder;
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return NextResponse.json(formatWcCategory(updated));
  } catch (error) {
    console.error("WC Single Category PUT error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to update category." }, { status: 500 });
  }
}

/**
 * DELETE /wp-json/wc/v3/products/categories/[id]
 */
async function DELETEHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Invalid ID." }, { status: 404 });
    }

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existing || !existing.isActive) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Category not found." }, { status: 404 });
    }

    // Standard WooCommerce delete option: force parameter defaults to false (meaning move to trash, but Categories do not have trash, so we either hard delete or set isActive to false).
    // Let's perform a physical delete. If there are dependent products, Prisma will throw. In that case, we can handle it.
    // In actions/categories.ts, it performs: prisma.category.delete.
    // Let's do the same. If it fails because of books, we return 400.
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true"; // WooCommerce force param

    if (force) {
      try {
        await prisma.category.delete({
          where: { id: categoryId },
        });
      } catch (err) {
        return NextResponse.json({
          code: "category_delete_failed",
          message: "Cannot delete category containing books. Delete or reassign books first.",
        }, { status: 400 });
      }
    } else {
      // Just mark inactive
      await prisma.category.update({
        where: { id: categoryId },
        data: { isActive: false },
      });
    }

    return NextResponse.json(formatWcCategory(existing));
  } catch (error) {
    console.error("WC Single Category DELETE error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to delete category." }, { status: 500 });
  }
}

export const GET = withWcLogging(GETHandler);
export const PUT = withWcLogging(PUTHandler);
export const DELETE = withWcLogging(DELETEHandler);
