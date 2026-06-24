// app/api/admin/credentials/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET: Retrieve list of generated API Keys.
 * Protected: Admin only.
 */
export async function GET() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session || userRole !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const keys = await prisma.apiCredential.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(keys);
  } catch (error) {
    console.error("Failed to fetch API credentials:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST: Generate new API credentials.
 * Protected: Admin only.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session || userRole !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const description = body.description || "POS Sync integration";
    const permissions = body.permissions || "read_write";

    // Generate WooCommerce-compatible consumer key and secret
    // ck_ + 40 random hex chars
    const consumerKey = `ck_${crypto.randomBytes(20).toString("hex")}`;
    // cs_ + 40 random hex chars
    const consumerSecret = `cs_${crypto.randomBytes(20).toString("hex")}`;

    const credential = await prisma.apiCredential.create({
      data: {
        description,
        consumerKey,
        consumerSecret,
        permissions,
        isActive: true,
      },
    });

    // Return credentials with the raw secret so the user can copy it once
    return NextResponse.json({
      id: credential.id,
      description: credential.description,
      consumerKey: credential.consumerKey,
      consumerSecret: credential.consumerSecret, // Displayed ONLY ONCE here
      permissions: credential.permissions,
      isActive: credential.isActive,
      createdAt: credential.createdAt,
    });
  } catch (error) {
    console.error("Failed to generate API credentials:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE: Revoke/delete a key.
 */
export async function DELETE(req: Request) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session || userRole !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    await prisma.apiCredential.delete({
      where: { id: keyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete API credential:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
