// app/admin/settings/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import { Settings, Save, AlertCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveStoreSettings } from "@/actions/settings";
import { APP_NAME, APP_CONTACT, APP_EMAIL, APP_ADDRESS, DEFAULT_CURRENCY } from "@/lib/constants";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // 1. Fetch settings from database
  const settingsRecord = await prisma.setting.findUnique({
    where: { key: "general_settings" },
  });

  const settings = (settingsRecord?.value as any) || {
    storeName: APP_NAME,
    currency: DEFAULT_CURRENCY,
    shippingFlatRate: 0,
    contactEmail: APP_EMAIL,
    contactPhone: APP_CONTACT,
    storeAddress: APP_ADDRESS,
  };

  // 2. Fetch chatbot-info.md from filesystem
  let chatbotInfoContent = "";
  try {
    const kbPath = path.join(process.cwd(), "chatbot-info.md");
    if (fs.existsSync(kbPath)) {
      chatbotInfoContent = fs.readFileSync(kbPath, "utf-8");
    }
  } catch (err) {
    console.error("Failed to read chatbot-info.md for admin settings:", err);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <Settings size={28} className="text-gold" />
            General Settings
          </h1>
          <p className="text-xs text-muted">Configure store branding, currency units, flat delivery shipping costs, shop locations, and the AI chatbot knowledge base.</p>
        </div>
      </div>

      <div className="max-w-4xl bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-6 shadow-sm">
        
        {/* Info Box */}
        <div className="flex gap-3 bg-gold/5 border border-gold/20 p-4 rounded-lg text-xs leading-relaxed text-gold">
          <AlertCircle size={16} className="flex-shrink-0" />
          <p>
            These properties define global storefront metadata. Make sure to double check contact details, flat shipping rates, and the AI chatbot knowledge base to avoid checkout errors and customer support mismatches.
          </p>
        </div>

        <form action={saveStoreSettings} className="space-y-4">
          
          {/* Store Name */}
          <Input
            label="Store Branding Name *"
            name="storeName"
            defaultValue={settings.storeName}
            placeholder="Mirza Book Depot"
            required
          />

          {/* Grid fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Currency */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Shop Currency
              </label>
              <select
                name="currency"
                defaultValue={settings.currency}
                className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="PKR">Pakistani Rupee (PKR)</option>
                <option value="USD">United States Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            {/* Shipping rate */}
            <Input
              label="Flat Shipping Cost (PKR) *"
              name="shippingFlatRate"
              type="number"
              defaultValue={String(settings.shippingFlatRate)}
              placeholder="0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contact Email */}
            <Input
              label="Store Contact Email *"
              name="contactEmail"
              type="email"
              defaultValue={settings.contactEmail}
              placeholder="info@mirzabookdepot.com"
              required
            />

            {/* Contact Phone */}
            <Input
              label="Store Contact Phone *"
              name="contactPhone"
              defaultValue={settings.contactPhone}
              placeholder="03336566000"
              required
            />
          </div>

          {/* Shop Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Store Physical Address
            </label>
            <textarea
              name="storeAddress"
              defaultValue={settings.storeAddress}
              placeholder="Allah o Akbar Chowk, Mirza Plaza, Depalpur"
              rows={3}
              required
              className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none"
            />
          </div>

          {/* Chatbot Knowledge Base */}
          <div className="border-t border-border/60 pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bot size={22} className="text-gold" />
              <h3 className="font-display text-lg font-bold text-ink">Chatbot Knowledge Base</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              This markdown document provides context to the AI Assistant. Use it to document store information, operating hours, delivery timelines, return policies, contact methods, and general FAQs. The chatbot uses this context directly to respond to customer inquiries.
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Knowledge Base Content (Markdown Format)
              </label>
              <textarea
                name="chatbotInfo"
                defaultValue={chatbotInfoContent}
                placeholder="# Store Policies..."
                rows={14}
                className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint font-mono leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-border/60 flex justify-end">
            <Button type="submit" variant="primary" className="px-6 h-11 rounded-[var(--radius-btn)] font-semibold flex items-center gap-1.5 cursor-pointer">
              <Save size={16} />
              Save Configuration Settings
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
