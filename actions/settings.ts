// actions/settings.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import {
  APP_NAME,
  APP_CONTACT,
  APP_LANDLINE,
  APP_EMAIL,
  APP_ADDRESS,
  APP_CITY,
  APP_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_OPENING_TIME,
  DEFAULT_CLOSING_TIME,
  DEFAULT_OPERATING_DAYS,
  DEFAULT_CLOSED_DAYS,
  SOCIAL_LINKS,
} from "@/lib/constants";
import type {
  SocialLinks,
  CustomSocialLink,
  StoreSettingsData,
} from "@/types/settings";

/**
 * Fetch current store settings with reliable fallbacks
 */
export async function getStoreSettings(): Promise<StoreSettingsData> {
  try {
    const record = await prisma.setting.findUnique({
      where: { key: "general_settings" },
    });
    const val = (record?.value && typeof record.value === "object"
      ? (record.value as Record<string, unknown>)
      : {}) as Record<string, unknown>;
    const sl = (val.socialLinks && typeof val.socialLinks === "object"
      ? (val.socialLinks as Record<string, unknown>)
      : {}) as Record<string, unknown>;

    const socialLinks: SocialLinks = {
      facebook:
        typeof sl.facebook === "string"
          ? sl.facebook
          : typeof val.socialFacebook === "string"
          ? val.socialFacebook
          : SOCIAL_LINKS.facebook,
      instagram:
        typeof sl.instagram === "string"
          ? sl.instagram
          : typeof val.socialInstagram === "string"
          ? val.socialInstagram
          : SOCIAL_LINKS.instagram,
      whatsapp:
        typeof sl.whatsapp === "string"
          ? sl.whatsapp
          : typeof val.socialWhatsapp === "string"
          ? val.socialWhatsapp
          : SOCIAL_LINKS.whatsapp,
      twitter:
        typeof sl.twitter === "string"
          ? sl.twitter
          : typeof val.socialTwitter === "string"
          ? val.socialTwitter
          : "",
      youtube:
        typeof sl.youtube === "string"
          ? sl.youtube
          : typeof val.socialYoutube === "string"
          ? val.socialYoutube
          : "",
      linkedin:
        typeof sl.linkedin === "string"
          ? sl.linkedin
          : typeof val.socialLinkedin === "string"
          ? val.socialLinkedin
          : "",
      tiktok:
        typeof sl.tiktok === "string"
          ? sl.tiktok
          : typeof val.socialTiktok === "string"
          ? val.socialTiktok
          : "",
    };

    const customSocialLinks: CustomSocialLink[] = Array.isArray(val.customSocialLinks)
      ? (val.customSocialLinks as CustomSocialLink[])
      : [];

    return {
      storeName: (typeof val.storeName === "string" ? val.storeName : null) || APP_NAME,
      currency: (typeof val.currency === "string" ? val.currency : null) || DEFAULT_CURRENCY,
      shippingFlatRate: typeof val.shippingFlatRate === "number" ? val.shippingFlatRate : 200,
      contactEmail: (typeof val.contactEmail === "string" ? val.contactEmail : null) || APP_EMAIL,
      contactPhone: (typeof val.contactPhone === "string" ? val.contactPhone : null) || APP_CONTACT,
      contactLandline: (typeof val.contactLandline === "string" ? val.contactLandline : null) || APP_LANDLINE,
      storeAddress: (typeof val.storeAddress === "string" ? val.storeAddress : null) || APP_ADDRESS,
      storeCity: (typeof val.storeCity === "string" ? val.storeCity : null) || APP_CITY,
      storeCountry: (typeof val.storeCountry === "string" ? val.storeCountry : null) || APP_COUNTRY,
      socialLinks,
      customSocialLinks,
      openingTime: (typeof val.openingTime === "string" ? val.openingTime : null) || DEFAULT_OPENING_TIME,
      closingTime: (typeof val.closingTime === "string" ? val.closingTime : null) || DEFAULT_CLOSING_TIME,
      operatingDays: (typeof val.operatingDays === "string" ? val.operatingDays : null) || DEFAULT_OPERATING_DAYS,
      closedDays: Array.isArray(val.closedDays) ? (val.closedDays as string[]) : DEFAULT_CLOSED_DAYS,
      closureNotice: (typeof val.closureNotice === "string" ? val.closureNotice : null) || "",
    };
  } catch (error) {
    console.error("Failed to fetch store settings:", error);
    return {
      storeName: APP_NAME,
      currency: DEFAULT_CURRENCY,
      shippingFlatRate: 200,
      contactEmail: APP_EMAIL,
      contactPhone: APP_CONTACT,
      contactLandline: APP_LANDLINE,
      storeAddress: APP_ADDRESS,
      storeCity: APP_CITY,
      storeCountry: APP_COUNTRY,
      socialLinks: {
        facebook: SOCIAL_LINKS.facebook,
        instagram: SOCIAL_LINKS.instagram,
        whatsapp: SOCIAL_LINKS.whatsapp,
        twitter: "",
        youtube: "",
        linkedin: "",
        tiktok: "",
      },
      customSocialLinks: [],
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
  const shippingFlatRate = parseFloat((formData.get("shippingFlatRate") as string) || "200");
  const contactEmail = (formData.get("contactEmail") as string) || APP_EMAIL;
  const contactPhone = (formData.get("contactPhone") as string) || APP_CONTACT;
  const contactLandline = (formData.get("contactLandline") as string) || APP_LANDLINE;
  const storeAddress = (formData.get("storeAddress") as string) || APP_ADDRESS;
  const storeCity = (formData.get("storeCity") as string) || APP_CITY;
  const storeCountry = (formData.get("storeCountry") as string) || APP_COUNTRY;

  // Social Media Links
  const socialFacebook = ((formData.get("socialFacebook") as string) || "").trim();
  const socialInstagram = ((formData.get("socialInstagram") as string) || "").trim();
  const socialWhatsapp = ((formData.get("socialWhatsapp") as string) || "").trim();
  const socialTwitter = ((formData.get("socialTwitter") as string) || "").trim();
  const socialYoutube = ((formData.get("socialYoutube") as string) || "").trim();
  const socialLinkedin = ((formData.get("socialLinkedin") as string) || "").trim();
  const socialTiktok = ((formData.get("socialTiktok") as string) || "").trim();

  let customSocialLinks: CustomSocialLink[] = [];
  const customLinksRaw = formData.get("customSocialLinks") as string;
  if (customLinksRaw) {
    try {
      customSocialLinks = JSON.parse(customLinksRaw);
    } catch (e) {
      console.error("Failed to parse customSocialLinks:", e);
    }
  }

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
      shippingFlatRate: isNaN(shippingFlatRate) ? 200 : shippingFlatRate,
      contactEmail,
      contactPhone,
      contactLandline,
      storeAddress,
      storeCity,
      storeCountry,
      socialLinks: {
        facebook: socialFacebook,
        instagram: socialInstagram,
        whatsapp: socialWhatsapp,
        twitter: socialTwitter,
        youtube: socialYoutube,
        linkedin: socialLinkedin,
        tiktok: socialTiktok,
      },
      customSocialLinks,
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
        value: settingsData as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      create: {
        key: "general_settings",
        value: settingsData as unknown as Prisma.InputJsonValue,
      },
    });

    // Save Chatbot Knowledge Base
    if (chatbotInfo !== null && chatbotInfo !== undefined) {
      const kbPath = path.join(process.cwd(), "chatbot-info.md");
      fs.writeFileSync(kbPath, chatbotInfo, "utf-8");
    }

    revalidatePath("/admin/settings");
    revalidatePath("/contact");
    revalidatePath("/about");
    revalidatePath("/shipping");
    revalidatePath("/returns");
    revalidatePath("/checkout/success");
    revalidatePath("/");
    return { success: true, message: "Store settings saved successfully!" };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to save store settings:", err);
    throw new Error(err.message || "Failed to save configuration settings.");
  }
}
