import { NextResponse } from "next/server";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcProduct, parseWcProduct } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";
import { logWcApi, withWcLogging } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import Decimal = Prisma.Decimal;

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wc/v3/products/[id]
 */
async function GETHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "read");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Invalid ID." }, { status: 404 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: true,
        variations: true,
      },
    });

    if (!product) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json(formatWcProduct(product));
  } catch (error) {
    logWcApi("ERROR", "PRODUCT_GET_SINGLE", "Failed to fetch single product.", error);
    console.error("WC Single Product GET error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to fetch product." }, { status: 500 });
  }
}

/**
 * PUT /wp-json/wc/v3/products/[id]
 */
async function PUTHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Invalid ID." }, { status: 404 });
    }

    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Product not found." }, { status: 404 });
    }

    const body = await req.json();

    // Map WooCommerce JSON format payload values
    const parsedData = parseWcProduct(body);

    const categoryIds = body.categories 
      ? (body.categories || []).map((c: any) => c.id)
      : undefined;

    // Build update payload
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = parsedData.name;
    if (body.slug !== undefined) updateData.slug = parsedData.slug;
    if (body.status !== undefined) updateData.status = parsedData.status;
    if (body.description !== undefined) updateData.description = parsedData.description;
    if (body.short_description !== undefined) updateData.shortDescription = parsedData.shortDescription;
    if (body.sku !== undefined) updateData.sku = parsedData.sku;
    if (body.regular_price !== undefined) updateData.regularPrice = parsedData.regularPrice;
    if (body.sale_price !== undefined) updateData.salePrice = parsedData.salePrice;
    if (body.manage_stock !== undefined) updateData.manageStock = parsedData.manageStock;
    if (body.stock_quantity !== undefined) updateData.stockQuantity = parsedData.stockQuantity;
    if (body.stock_status !== undefined) updateData.stockStatus = parsedData.stockStatus;
    if (body.weight !== undefined) updateData.weight = parsedData.weight;
    if (body.featured !== undefined) updateData.isFeatured = parsedData.isFeatured;
    if (body.images !== undefined) updateData.images = parsedData.images;
    if (body.attributes !== undefined) updateData.attributes = parsedData.attributes;

    // Meta metadata keys
    if (parsedData.isbn !== null) updateData.isbn = parsedData.isbn;
    if (parsedData.author !== null) updateData.author = parsedData.author;
    if (parsedData.publisher !== null) updateData.publisher = parsedData.publisher;
    if (parsedData.publishYear !== null) updateData.publishYear = parsedData.publishYear;
    if (parsedData.pages !== null) updateData.pages = parsedData.pages;
    if (body.language !== undefined) updateData.language = parsedData.language;

    // Categories mapping updates
    if (categoryIds) {
      updateData.categories = {
        set: [], // clear
        connect: categoryIds.map((cId: number) => ({ id: cId })),
      };
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        categories: true,
        variations: true,
      },
    });

    logWcApi("INFO", "PRODUCT_PUT_SINGLE", `Product updated successfully: "${updated.name}" (ID: ${updated.id}, SKU: ${updated.sku || "N/A"})`);
    return NextResponse.json(formatWcProduct(updated));
  } catch (error) {
    logWcApi("ERROR", "PRODUCT_PUT_SINGLE", "Failed to update product.", error);
    console.error("WC Single Product PUT error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to update product." }, { status: 500 });
  }
}

/**
 * DELETE /wp-json/wc/v3/products/[id]
 */
async function DELETEHandler(req: Request, { params }: Params) {
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Invalid ID." }, { status: 404 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: true,
      },
    });

    if (!product) {
      return NextResponse.json({ code: "rest_invalid_id", message: "Product not found." }, { status: 404 });
    }

    // Perform delete
    await prisma.product.delete({
      where: { id: productId },
    });

    logWcApi("INFO", "PRODUCT_DELETE_SINGLE", `Product deleted successfully: "${product.name}" (ID: ${product.id}, SKU: ${product.sku || "N/A"})`);
    return NextResponse.json(formatWcProduct(product));
  } catch (error) {
    logWcApi("ERROR", "PRODUCT_DELETE_SINGLE", "Failed to delete product.", error);
    console.error("WC Single Product DELETE error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to delete product." }, { status: 500 });
  }
}

export const GET = withWcLogging(GETHandler);
export const PUT = withWcLogging(PUTHandler);
export const DELETE = withWcLogging(DELETEHandler);
