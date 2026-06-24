// app/wp-json/wc/v3/products/categories/batch/route.ts
import { NextResponse } from "next/server";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcCategory } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /wp-json/wc/v3/products/categories/batch
 * Process bulk creates, updates, and deletes for category sync.
 */
export async function POST(req: Request) {
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const body = await req.json();
    const createItems = body.create || [];
    const updateItems = body.update || [];
    const deleteItems = body.delete || [];

    const createdResults: any[] = [];
    const updatedResults: any[] = [];
    const deletedResults: any[] = [];

    // 1. Process Creates
    for (const item of createItems) {
      try {
        if (!item.name) continue;

        const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const parentId = item.parent ? parseInt(item.parent) : null;
        const displayOrder = item.menu_order ? parseInt(item.menu_order) : 0;
        const description = item.description || "";
        const imageUrl = item.image?.src || null;

        // Check uniqueness
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) {
          // If deactivated, we could reactivate it instead of throwing
          if (!existing.isActive) {
            const reactivated = await prisma.category.update({
              where: { id: existing.id },
              data: {
                name: item.name,
                parentId: parentId && !isNaN(parentId) ? parentId : null,
                description,
                imageUrl,
                displayOrder: isNaN(displayOrder) ? 0 : displayOrder,
                isActive: true,
              },
            });
            createdResults.push(formatWcCategory(reactivated));
          } else {
            console.warn(`Category slug duplicate in batch: ${slug}`);
          }
          continue;
        }

        const category = await prisma.category.create({
          data: {
            name: item.name,
            slug,
            parentId: parentId && !isNaN(parentId) ? parentId : null,
            description,
            imageUrl,
            displayOrder: isNaN(displayOrder) ? 0 : displayOrder,
            isActive: true,
          },
        });
        createdResults.push(formatWcCategory(category));
      } catch (err) {
        console.error("Batch Create category fail:", err);
      }
    }

    // 2. Process Updates
    for (const item of updateItems) {
      try {
        const categoryId = parseInt(item.id);
        if (isNaN(categoryId)) continue;

        const existing = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!existing) continue;

        const updateData: any = {};
        if (item.name !== undefined) updateData.name = item.name;

        if (item.slug !== undefined && item.slug !== existing.slug) {
          const dup = await prisma.category.findUnique({ where: { slug: item.slug } });
          if (!dup) {
            updateData.slug = item.slug;
          }
        }

        if (item.parent !== undefined) {
          const parentId = item.parent ? parseInt(item.parent) : null;
          updateData.parentId = parentId && !isNaN(parentId) ? parentId : null;
        }

        if (item.description !== undefined) updateData.description = item.description;
        if (item.image?.src !== undefined) updateData.imageUrl = item.image.src;
        if (item.menu_order !== undefined) {
          const menuOrder = parseInt(item.menu_order);
          updateData.displayOrder = isNaN(menuOrder) ? 0 : menuOrder;
        }

        const updated = await prisma.category.update({
          where: { id: categoryId },
          data: updateData,
        });
        updatedResults.push(formatWcCategory(updated));
      } catch (err) {
        console.error("Batch Update category fail:", err);
      }
    }

    // 3. Process Deletes
    for (const deleteId of deleteItems) {
      try {
        const categoryId = parseInt(deleteId);
        if (isNaN(categoryId)) continue;

        const existing = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!existing) continue;

        // Perform hard delete. If products connect to it, it will fail.
        // We will catch and do a soft delete in that case.
        try {
          await prisma.category.delete({ where: { id: categoryId } });
        } catch {
          await prisma.category.update({
            where: { id: categoryId },
            data: { isActive: false },
          });
        }
        deletedResults.push(formatWcCategory(existing));
      } catch (err) {
        console.error("Batch Delete category fail:", err);
      }
    }

    return NextResponse.json({
      create: createdResults,
      update: updatedResults,
      delete: deletedResults,
    });
  } catch (error) {
    console.error("WC Categories Batch POST error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to process batch." }, { status: 500 });
  }
}
