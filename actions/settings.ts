// actions/settings.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

/**
 * Server Action to save store configuration settings
 */
export async function saveStoreSettings(formData: FormData) {
  const storeName = formData.get("storeName") as string;
  const currency = formData.get("currency") as string || "PKR";
  const shippingFlatRate = parseFloat(formData.get("shippingFlatRate") as string || "0");
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const storeAddress = formData.get("storeAddress") as string;

  try {
    // Save setting keys
    const settingsData = {
      storeName,
      currency,
      shippingFlatRate: isNaN(shippingFlatRate) ? 0 : shippingFlatRate,
      contactEmail,
      contactPhone,
      storeAddress,
    };

    // Upsert the general settings key in the database
    await prisma.setting.upsert({
      where: { key: "general_settings" },
      update: {
        value: settingsData as any,
        updatedAt: new Date(),
      },
      create: {
        key: "general_settings",
        value: settingsData as any,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to save store settings:", error);
    throw new Error("Failed to save configuration settings.");
  }
}
