import { NextResponse } from "next/server";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcProduct, parseWcProduct } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";
import { logWcApi } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import Decimal = Prisma.Decimal;

export const dynamic = "force-dynamic";

/**
 * POST /wp-json/wc/v3/products/batch
 * Process bulk creates, updates, and deletes for books.
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

    logWcApi("INFO", "PRODUCTS_BATCH", `Received batch request. Creates: ${createItems.length} | Updates: ${updateItems.length} | Deletes: ${deleteItems.length}`);

    const createdResults: any[] = [];
    const updatedResults: any[] = [];
    const deletedResults: any[] = [];

    // 1. Process Creates
    for (const item of createItems) {
      try {
        const parsed = parseWcProduct(item);
        const categoryIds = (item.categories || []).map((c: any) => c.id);

        const product = await prisma.product.create({
          data: {
            name: parsed.name,
            slug: parsed.slug || `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
            type: parsed.type,
            status: parsed.status,
            description: parsed.description,
            shortDescription: parsed.shortDescription,
            sku: parsed.sku,
            regularPrice: parsed.regularPrice,
            salePrice: parsed.salePrice,
            manageStock: parsed.manageStock,
            stockQuantity: parsed.stockQuantity,
            stockStatus: parsed.stockStatus,
            weight: parsed.weight,
            isFeatured: parsed.isFeatured,
            images: parsed.images,
            attributes: parsed.attributes,
            isbn: parsed.isbn,
            author: parsed.author,
            publisher: parsed.publisher,
            publishYear: parsed.publishYear,
            pages: parsed.pages,
            language: parsed.language,
            categories: {
              connect: categoryIds.map((id: number) => ({ id })),
            },
          },
          include: {
            categories: true,
            variations: true,
          },
        });
        createdResults.push(formatWcProduct(product));
      } catch (err: any) {
        logWcApi("ERROR", "PRODUCTS_BATCH_CREATE", `Failed to create item in batch: "${item.name}" (SKU: ${item.sku || "N/A"})`, err);
        console.error("Batch Create item fail:", err);
      }
    }

    // 2. Process Updates
    for (const item of updateItems) {
      try {
        const productId = parseInt(item.id);
        if (isNaN(productId)) continue;

        const parsed = parseWcProduct(item);
        const categoryIds = item.categories
          ? (item.categories || []).map((c: any) => c.id)
          : undefined;

        // Build updates payload
        const updateData: any = {};
        if (item.name !== undefined) updateData.name = parsed.name;
        if (item.slug !== undefined) updateData.slug = parsed.slug;
        if (item.status !== undefined) updateData.status = parsed.status;
        if (item.description !== undefined) updateData.description = parsed.description;
        if (item.short_description !== undefined) updateData.shortDescription = parsed.shortDescription;
        if (item.sku !== undefined) updateData.sku = parsed.sku;
        if (item.regular_price !== undefined) updateData.regularPrice = parsed.regularPrice;
        if (item.sale_price !== undefined) updateData.salePrice = parsed.salePrice;
        if (item.manage_stock !== undefined) updateData.manageStock = parsed.manageStock;
        if (item.stock_quantity !== undefined) updateData.stockQuantity = parsed.stockQuantity;
        if (item.stock_status !== undefined) updateData.stockStatus = parsed.stockStatus;
        if (item.weight !== undefined) updateData.weight = parsed.weight;
        if (item.featured !== undefined) updateData.isFeatured = parsed.isFeatured;
        if (item.images !== undefined) updateData.images = parsed.images;
        if (item.attributes !== undefined) updateData.attributes = parsed.attributes;

        if (parsed.isbn !== null) updateData.isbn = parsed.isbn;
        if (parsed.author !== null) updateData.author = parsed.author;
        if (parsed.publisher !== null) updateData.publisher = parsed.publisher;
        if (parsed.publishYear !== null) updateData.publishYear = parsed.publishYear;
        if (parsed.pages !== null) updateData.pages = parsed.pages;
        if (item.language !== undefined) updateData.language = parsed.language;

        if (categoryIds) {
          updateData.categories = {
            set: [],
            connect: categoryIds.map((cId: number) => ({ id: cId })),
          };
        }

        const product = await prisma.product.update({
          where: { id: productId },
          data: updateData,
          include: {
            categories: true,
            variations: true,
          },
        });
        updatedResults.push(formatWcProduct(product));
      } catch (err: any) {
        logWcApi("ERROR", "PRODUCTS_BATCH_UPDATE", `Failed to update item ID ${item.id} in batch.`, err);
        console.error("Batch Update item fail:", err);
      }
    }

    // 3. Process Deletes
    for (const deleteId of deleteItems) {
      try {
        const productId = parseInt(deleteId);
        if (isNaN(productId)) continue;

        const product = await prisma.product.delete({
          where: { id: productId },
          include: {
            categories: true,
          },
        });
        deletedResults.push(formatWcProduct(product));
      } catch (err: any) {
        logWcApi("ERROR", "PRODUCTS_BATCH_DELETE", `Failed to delete item ID ${deleteId} in batch.`, err);
        console.error("Batch Delete item fail:", err);
      }
    }

    logWcApi("INFO", "PRODUCTS_BATCH", `Batch processed successfully. Created: ${createdResults.length}/${createItems.length} | Updated: ${updatedResults.length}/${updateItems.length} | Deleted: ${deletedResults.length}/${deleteItems.length}`);

    return NextResponse.json({
      create: createdResults,
      update: updatedResults,
      delete: deletedResults,
    });
  } catch (error) {
    logWcApi("ERROR", "PRODUCTS_BATCH", "Failed to process batch request.", error);
    console.error("WC Products Batch POST error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to process batch." }, { status: 500 });
  }
}
