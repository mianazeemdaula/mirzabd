// app/api/store/settings/route.ts
import { NextResponse } from "next/server";
import { getStoreSettings } from "@/actions/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to retrieve store settings:", error);
    return NextResponse.json(
      { error: "Failed to retrieve store settings" },
      { status: 500 }
    );
  }
}
