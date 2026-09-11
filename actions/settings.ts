// actions/settings.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import {
  APP_NAME,
  APP_CONTACT,
  APP_EMAIL,
  APP_ADDRESS,
  DEFAULT_CURRENCY,
  DEFAULT_OPENING_TIME,
  DEFAULT_CLOSING_TIME,
  DEFAULT_OPERATING_DAYS,
  DEFAULT_CLOSED_DAYS,
} from "@/lib/constants";

export interface StoreSettingsData {
  storeName: string;
  currency: string;
  shippingFlatRate: number;
  contactEmail: string;
  contactPhone: string;
  storeAddress: string;
  openingTime: string;
  closingTime: string;
  operatingDays: string;
  closedDays: string[];
  closureNotice: string;
}

/**
 * Fetch current store settings with reliable fallbacks
 */
export async function getStoreSettings(): Promise<StoreSettingsData> {
  try {
    const record = await prisma.setting.findUnique({
      where: { key: "general_settings" },
    });
    const val = record?.value as any;

    return {
      storeName: val?.storeName || APP_NAME,
      currency: val?.currency || DEFAULT_CURRENCY,
      shippingFlatRate: typeof val?.shippingFlatRate === "number" ? val.shippingFlatRate : 0,
      contactEmail: val?.contactEmail || APP_EMAIL,
      contactPhone: val?.contactPhone || APP_CONTACT,
      storeAddress: val?.storeAddress || APP_ADDRESS,
      openingTime: val?.openingTime || DEFAULT_OPENING_TIME,
      closingTime: val?.closingTime || DEFAULT_CLOSING_TIME,
      operatingDays: val?.operatingDays || DEFAULT_OPERATING_DAYS,
      closedDays: Array.isArray(val?.closedDays) ? val.closedDays : DEFAULT_CLOSED_DAYS,
      closureNotice: val?.closureNotice || "",
    };
  } catch (error) {
    console.error("Failed to fetch store settings:", error);
    return {
      storeName: APP_NAME,
      currency: DEFAULT_CURRENCY,
      shippingFlatRate: 0,
      contactEmail: APP_EMAIL,
      contactPhone: APP_CONTACT,
      storeAddress: APP_ADDRESS,
      openingTime: DEFAULT_OPENING_TIME,
      closingTime: DEFAULT_CLOSING_TIME,
      operatingDays: DEFAULT_OPERATING_DAYS,
      closedDays: DEFAULT_CLOSED_DAYS,
      closureNotice: "",
    };
  }
}

/**
 * Server Action to save store configuration settings
 */
export async function saveStoreSettings(formData: FormData) {
  const storeName = (formData.get("storeName") as string) || APP_NAME;
  const currency = (formData.get("currency") as string) || DEFAULT_CURRENCY;
  const shippingFlatRate = parseFloat((formData.get("shippingFlatRate") as string) || "0");
  const contactEmail = (formData.get("contactEmail") as string) || APP_EMAIL;
  const contactPhone = (formData.get("contactPhone") as string) || APP_CONTACT;
  const storeAddress = (formData.get("storeAddress") as string) || APP_ADDRESS;

  // Store Timings & Closed Days options
  const openingTime = (formData.get("openingTime") as string) || DEFAULT_OPENING_TIME;
  const closingTime = (formData.get("closingTime") as string) || DEFAULT_CLOSING_TIME;
  const operatingDays = (formData.get("operatingDays") as string) || DEFAULT_OPERATING_DAYS;
  const closureNotice = (formData.get("closureNotice") as string) || "";
  const closedDays = formData.getAll("closedDays") as string[];

  const chatbotInfo = formData.get("chatbotInfo") as string;

  try {
    const settingsData: StoreSettingsData = {
      storeName,
      currency,
      shippingFlatRate: isNaN(shippingFlatRate) ? 0 : shippingFlatRate,
      contactEmail,
      contactPhone,
      storeAddress,
      openingTime,
      closingTime,
      operatingDays,
      closedDays,
      closureNotice,
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

    // Save Chatbot Knowledge Base
    if (chatbotInfo !== null && chatbotInfo !== undefined) {
      const kbPath = path.join(process.cwd(), "chatbot-info.md");
      fs.writeFileSync(kbPath, chatbotInfo, "utf-8");
    }

    revalidatePath("/admin/settings");
    revalidatePath("/contact");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to save store settings:", error);
    throw new Error("Failed to save configuration settings.");
  }
}
