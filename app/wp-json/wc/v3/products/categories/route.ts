import { NextResponse } from "next/server";
import { wcAuthenticate } from "@/lib/wc-auth";
import { formatWcCategory } from "@/lib/wc-formatters";
import prisma from "@/lib/prisma";
import { generateUniqueCategorySlug, normalizeCategorySlug } from "@/lib/slug-helper";
import { logWcApi, withWcLogging } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /wp-json/wc/v3/products/categories
 */
async function GETHandler(req: Request) {
  const authResult = await wcAuthenticate(req, "read");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "20");
    const hideEmpty = searchParams.get("hide_empty") === "true";

    const where: any = {
      isActive: true,
    };
    if (hideEmpty) {
      where.count = { gt: 0 };
    }

    const skip = (page - 1) * perPage;
    const take = perPage;

    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { displayOrder: "asc" },
        skip,
        take,
      }),
      prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);
    const formatted = categories.map(formatWcCategory);

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-WP-Total": String(totalCount),
        "X-WP-TotalPages": String(totalPages),
      },
    });
  } catch (error) {
    logWcApi("ERROR", "CATEGORIES_GET", "Failed to fetch categories list.", error);
    console.error("WC Categories GET error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to fetch categories." }, { status: 500 });
  }
}

/**
 * POST /wp-json/wc/v3/products/categories
 */
async function POSTHandler(req: Request) {
  const authResult = await wcAuthenticate(req, "write");
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }

  try {
    const body = await req.json();
    if (!body.name) {
      logWcApi("WARNING", "CATEGORIES_POST", "Failed to create category: missing name parameter.");
      return NextResponse.json({ code: "rest_missing_callback_param", message: "Missing parameter name." }, { status: 400 });
    }

    const slug = normalizeCategorySlug(body.slug || "") || (await generateUniqueCategorySlug(body.name));
    const parentId = body.parent ? parseInt(body.parent) : null;
    const displayOrder = body.menu_order ? parseInt(body.menu_order) : 0;
    const description = body.description || "";
    const imageUrl = body.image?.src || null;

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      logWcApi("WARNING", "CATEGORIES_POST", `Failed to create category: slug "${slug}" already exists.`);
      return NextResponse.json({ code: "category_invalid_slug", message: "A category with this slug already exists." }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        parentId: parentId && !isNaN(parentId) ? parentId : null,
        description,
        imageUrl,
        displayOrder: isNaN(displayOrder) ? 0 : displayOrder,
        isActive: true,
      },
    });

    logWcApi("INFO", "CATEGORIES_POST", `Category created successfully: "${category.name}" (ID: ${category.id}, Slug: ${category.slug})`);
    return NextResponse.json(formatWcCategory(category), { status: 201 });
  } catch (error) {
    logWcApi("ERROR", "CATEGORIES_POST", "Failed to create category.", error);
    console.error("WC Categories POST error:", error);
    return NextResponse.json({ code: "internal_error", message: "Failed to create category." }, { status: 500 });
  }
}

export const GET = withWcLogging(GETHandler);
export const POST = withWcLogging(POSTHandler);
