import { NextResponse } from "next/server";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcProduct, parseWcProduct } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";
import { logWcApi, withWcLogging } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { generateUniqueProductSlug } from "@/lib/slug-helper";
import Decimal = Prisma.Decimal;

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wc/v3/products
 * Fetch list of products (books) in WooCommerce format.
 */
async function GETHandler(req: Request) {
  // 1. Authenticate API Key permissions
  const authResult = await wcAuthenticate(req, "read");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "10");
    const sku = searchParams.get("sku");
    const status = searchParams.get("status") || "publish";

    // Build Prisma query clauses
    const where: any = {
      status,
    };
    if (sku) {
      where.sku = sku;
    }

    const skip = (page - 1) * perPage;
    const take = perPage;

    // Fetch products & total count
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categories: true,
          variations: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);

    // Format products to WooCommerce format
    const formattedProducts = products.map(formatWcProduct);

    // Return with WC headers
    return new Response(JSON.stringify(formattedProducts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-WP-Total": String(totalCount),
        "X-WP-TotalPages": String(totalPages),
      },
    });
  } catch (error) {
    logWcApi("ERROR", "PRODUCTS_GET", "Failed to fetch products.", error);
    console.error("WC Products GET error:", error);
    return NextResponse.json(
      { code: "internal_error", message: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

/**
 * POST /wp-json/wc/v3/products
 * Create a new product (book) in WooCommerce format.
 */
async function POSTHandler(req: Request) {
  // 1. Authenticate API Key permissions
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const body = await req.json();
    if (!body.name) {
      logWcApi("WARNING", "PRODUCTS_POST", "Failed to create product: missing parameter 'name'.");
      return NextResponse.json(
        { code: "rest_missing_callback_param", message: "Missing parameter name." },
        { status: 400 }
      );
    }

    // 2. Parse WooCommerce JSON structure into Prisma input format
    const parsedData = parseWcProduct(body);

    // Check slug uniqueness and generate a unique one if needed
    const slug = await generateUniqueProductSlug(parsedData.slug || parsedData.name);

    // Resolve categories if sent in body
    const categoryIds = (body.categories || []).map((c: any) => c.id);

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: parsedData.name,
        slug,
        type: parsedData.type,
        status: parsedData.status,
        description: parsedData.description,
        shortDescription: parsedData.shortDescription,
        sku: parsedData.sku,
        regularPrice: parsedData.regularPrice,
        salePrice: parsedData.salePrice,
        manageStock: parsedData.manageStock,
        stockQuantity: parsedData.stockQuantity,
        stockStatus: parsedData.stockStatus,
        weight: parsedData.weight,
        isFeatured: parsedData.isFeatured,
        images: parsedData.images,
        attributes: parsedData.attributes,
        isbn: parsedData.isbn,
        author: parsedData.author,
        publisher: parsedData.publisher,
        publishYear: parsedData.publishYear,
        pages: parsedData.pages,
        language: parsedData.language,
        categories: {
          connect: categoryIds.map((id: number) => ({ id })),
        },
      },
      include: {
        categories: true,
        variations: true,
      },
    });

    // 3. Format and return output
    logWcApi("INFO", "PRODUCTS_POST", `Product created successfully: "${product.name}" (ID: ${product.id}, SKU: ${product.sku || "N/A"})`);
    return NextResponse.json(formatWcProduct(product), { status: 201 });
  } catch (error) {
    logWcApi("ERROR", "PRODUCTS_POST", "Failed to create product.", error);
    console.error("WC Products POST error:", error);
    return NextResponse.json(
      { code: "internal_error", message: "Failed to create product." },
      { status: 500 }
    );
  }
}

export const GET = withWcLogging(GETHandler);
export const POST = withWcLogging(POSTHandler);
