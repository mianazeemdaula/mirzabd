// types/settings.ts

export interface SocialLinks {
  facebook: string;
  instagram: string;
  whatsapp: string;
  twitter: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
}

export interface CustomSocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface StoreSettingsData {
  storeName: string;
  currency: string;
  shippingFlatRate: number;
  contactEmail: string;
  contactPhone: string;     // Mobile / WhatsApp number
  contactLandline: string;  // Telephone / Landline number
  storeAddress: string;     // Physical address
  storeCity: string;
  storeCountry: string;
  socialLinks: SocialLinks;
  customSocialLinks: CustomSocialLink[];
  openingTime: string;
  closingTime: string;
  operatingDays: string;
  closedDays: string[];
  closureNotice: string;
}
