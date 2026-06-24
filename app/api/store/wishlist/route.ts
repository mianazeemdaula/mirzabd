// app/api/store/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            categories: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Return the array of full products
    const products = wishlistItems.map((item) => item.product);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("GET /api/store/wishlist error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId || typeof productId !== "number") {
      return NextResponse.json(
        { message: "Valid Product ID is required." },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if the item already exists in the user's wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
      return NextResponse.json({ added: false });
    } else {
      // Add to wishlist
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
      });
      return NextResponse.json({ added: true });
    }
  } catch (error: any) {
    console.error("POST /api/store/wishlist error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
