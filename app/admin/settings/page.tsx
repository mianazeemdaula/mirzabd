import React from "react";
import { Settings } from "lucide-react";
import { getStoreSettings } from "@/actions/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

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
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            <Settings size={28} className="text-gold" />
            Store Configuration & Social Settings
          </h1>
          <p className="text-xs text-muted">
            Configure store branding, contact phone numbers (mobile & landline), physical address, social media links, operating schedule, and AI chatbot knowledge base.
          </p>
        </div>
      </div>

      <SettingsForm initialSettings={settings} initialChatbotInfo={chatbotInfoContent} />
    </div>
  );
}
