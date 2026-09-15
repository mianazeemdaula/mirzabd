// components/admin/settings-form.tsx
"use client";

import React, { useState, useTransition } from "react";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Share2,
  Clock,
  Calendar,
  Bot,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  CheckCircle,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon, TikTokIcon, XTwitterIcon } from "@/components/ui/social-icons";
import { saveStoreSettings, StoreSettingsData, CustomSocialLink, formatWhatsAppUrl } from "@/actions/settings";

interface SettingsFormProps {
  initialSettings: StoreSettingsData;
  initialChatbotInfo: string;
}

export function SettingsForm({ initialSettings, initialChatbotInfo }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  // Custom social links state
  const [customLinks, setCustomLinks] = useState<CustomSocialLink[]>(
    initialSettings.customSocialLinks || []
  );

  // Social link state for live preview testing
  const [socials, setSocials] = useState({
    facebook: initialSettings.socialLinks?.facebook || "",
    instagram: initialSettings.socialLinks?.instagram || "",
    whatsapp: initialSettings.socialLinks?.whatsapp || "",
    twitter: initialSettings.socialLinks?.twitter || "",
    youtube: initialSettings.socialLinks?.youtube || "",
    linkedin: initialSettings.socialLinks?.linkedin || "",
    tiktok: initialSettings.socialLinks?.tiktok || "",
  });

  const handleAddCustomLink = () => {
    setCustomLinks((prev) => [
      ...prev,
      {
        id: `custom_${Date.now()}`,
        platform: "",
        url: "",
      },
    ]);
  };

  const handleRemoveCustomLink = (id: string) => {
    setCustomLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCustomLinkChange = (id: string, field: "platform" | "url", value: string) => {
    setCustomLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Filter and append custom links as JSON
    const validCustomLinks = customLinks.filter(
      (link) => link.platform.trim() !== "" && link.url.trim() !== ""
    );
    formData.set("customSocialLinks", JSON.stringify(validCustomLinks));

    startTransition(async () => {
      try {
        await saveStoreSettings(formData);
        toast.success("Store configuration & social settings saved successfully!");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save settings. Please try again.";
        toast.error(message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Brand & General Settings */}
      <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <Store size={22} className="text-gold" />
          <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
            Store Identity & Currency
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1">
            <Input
              label="Store Branding Name *"
              name="storeName"
              defaultValue={initialSettings.storeName}
              placeholder="Mirza Book Depot"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Store Currency *
            </label>
            <select
              name="currency"
              defaultValue={initialSettings.currency}
              className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="PKR">Pakistani Rupee (PKR - Rs.)</option>
              <option value="USD">United States Dollar (USD - $)</option>
              <option value="EUR">Euro (EUR - €)</option>
              <option value="GBP">British Pound (GBP - £)</option>
            </select>
          </div>

          <div>
            <Input
              label="Flat Shipping Delivery Fee *"
              name="shippingFlatRate"
              type="number"
              defaultValue={String(initialSettings.shippingFlatRate)}
              placeholder="200"
              required
            />
          </div>
        </div>
      </div>

      {/* 2. Contact & Physical Address Settings */}
      <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <Phone size={22} className="text-gold" />
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
                Contact Numbers & Physical Address
              </h2>
              <p className="text-xs text-muted">
                These contact details appear on the storefront header, footer, contact page, returns policy, and customer order confirmation receipts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Mobile / WhatsApp Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Smartphone size={14} className="text-gold" />
                Mobile / WhatsApp Contact Number *
              </label>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                WhatsApp Enabled
              </span>
            </div>
            <Input
              name="contactPhone"
              defaultValue={initialSettings.contactPhone}
              placeholder="03336566000"
              required
            />
            <p className="text-[11px] text-muted">
              Primary mobile line used for direct customer calls, SMS updates, and instant WhatsApp support.
            </p>
          </div>

          {/* Landline / Telephone Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Phone size={14} className="text-gold" />
                Landline / Office Telephone Number
              </label>
              <span className="text-[10px] font-semibold text-muted bg-elevated px-2 py-0.5 rounded border border-border">
                Desk Phone
              </span>
            </div>
            <Input
              name="contactLandline"
              defaultValue={initialSettings.contactLandline}
              placeholder="0444540357"
            />
            <p className="text-[11px] text-muted">
              Secondary landline / office phone displayed on footer, contact page, and chatbot inquiries.
            </p>
          </div>
        </div>

        {/* Contact Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Mail size={14} className="text-gold" />
            Store Support & Inquiries Email *
          </label>
          <Input
            name="contactEmail"
            type="email"
            defaultValue={initialSettings.contactEmail}
            placeholder="mirzabd8@gmail.com"
            required
          />
        </div>

        {/* Physical Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <MapPin size={14} className="text-gold" />
            Store Physical Street Address *
          </label>
          <textarea
            name="storeAddress"
            defaultValue={initialSettings.storeAddress}
            placeholder="Allah o Akbar Chowk, Mirza Plaza, Depalpur, Pakistan"
            rows={3}
            required
            className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none leading-relaxed"
          />
          <p className="text-[11px] text-muted">
            The physical depot / bookshop location shown in the footer, contact page map, self-pickup delivery option, and customer return instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            name="storeCity"
            defaultValue={initialSettings.storeCity || "Depalpur"}
            placeholder="Depalpur"
          />
          <Input
            label="Country"
            name="storeCountry"
            defaultValue={initialSettings.storeCountry || "Pakistan"}
            placeholder="Pakistan"
          />
        </div>
      </div>

      {/* 3. Social Media Links Settings */}
      <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <Share2 size={22} className="text-gold" />
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
                Social Media Channels & Links
              </h2>
              <p className="text-xs text-muted">
                Configure your official social media profile links. These will be dynamically linked and displayed across your storefront footer, contact page, and customer notifications.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
            Frontend Integrated
          </span>
        </div>

        {/* Pre-configured standard platforms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* WhatsApp */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-border bg-elevated/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <span className="p-1 rounded bg-[#25D366]/20 text-[#25D366]">
                  <WhatsAppIcon size={16} />
                </span>
                WhatsApp Link / Number
              </label>
              {socials.whatsapp && (
                <a
                  href={formatWhatsAppUrl(socials.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#25D366] hover:underline flex items-center gap-1"
                  title="Test WhatsApp Link"
                >
                  <span>Test Link</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <Input
              name="socialWhatsapp"
              value={socials.whatsapp}
              onChange={(e) => setSocials({ ...socials, whatsapp: e.target.value })}
              placeholder="03336566000 or https://wa.me/923336566000"
            />
            <p className="text-[11px] text-muted">
              Enter phone number (e.g. 03336566000) or complete link. It will automatically generate an active chat link.
            </p>
          </div>

          {/* Facebook */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-border bg-elevated/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <span className="p-1 rounded bg-[#1877F2]/20 text-[#1877F2]">
                  <Facebook size={16} />
                </span>
                Facebook Page URL
              </label>
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1877F2] hover:underline flex items-center gap-1"
                  title="Test Facebook Link"
                >
                  <span>Test Link</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <Input
              name="socialFacebook"
              value={socials.facebook}
              onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
              placeholder="https://facebook.com/mirzabookdepot"
            />
            <p className="text-[11px] text-muted">
              Full URL to your official Facebook page or group.
            </p>
          </div>

          {/* Instagram */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-border bg-elevated/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <span className="p-1 rounded bg-[#E4405F]/20 text-[#E4405F]">
                  <Instagram size={16} />
                </span>
                Instagram Profile URL
              </label>
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#E4405F] hover:underline flex items-center gap-1"
                  title="Test Instagram Link"
                >
                  <span>Test Link</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <Input
              name="socialInstagram"
              value={socials.instagram}
              onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
              placeholder="https://instagram.com/mirzabookdepot"
            />
            <p className="text-[11px] text-muted">
              Full URL to your store&apos;s Instagram profile.
            </p>
          </div>

          {/* X / Twitter */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-border bg-elevated/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <span className="p-1 rounded bg-white/10 text-ink">
                  <XTwitterIcon size={16} />
                </span>
                X (Twitter) Profile URL
              </label>
              {socials.twitter && (
                <a
                  href={socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold hover:underline flex items-center gap-1"
                  title="Test X / Twitter Link"
                >
                  <span>Test Link</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <Input
              name="socialTwitter"
              value={socials.twitter}
              onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
              placeholder="https://x.com/mirzabookdepot"
            />
            <p className="text-[11px] text-muted">
              Link to your X (Twitter) account.
            </p>
          </div>

          {/* YouTube */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-border bg-elevated/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <span className="p-1 rounded bg-[#FF0000]/20 text-[#FF0000]">
                  <Youtube size={16} />
                </span>
                YouTube Channel URL
              </label>
              {socials.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#FF0000] hover:underline flex items-center gap-1"
                  title="Test YouTube Link"
                >
                  <span>Test Link</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <Input
              name="socialYoutube"
              value={socials.youtube}
              onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
              placeholder="https://youtube.com/@mirzabookdepot"
            />
            <p className="text-[11px] text-muted">
              Link to your official YouTube channel for book reviews and video podcasts.
            </p>
          </div>

          {/* TikTok */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-border bg-elevated/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <span className="p-1 rounded bg-teal-500/20 text-teal-400">
                  <TikTokIcon size={16} />
                </span>
                TikTok Profile URL
              </label>
              {socials.tiktok && (
                <a
                  href={socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                  title="Test TikTok Link"
                >
                  <span>Test Link</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <Input
              name="socialTiktok"
              value={socials.tiktok}
              onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
              placeholder="https://tiktok.com/@mirzabookdepot"
            />
            <p className="text-[11px] text-muted">
              BookTok & short-form video profile.
            </p>
          </div>

          {/* LinkedIn */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-border bg-elevated/40 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <span className="p-1 rounded bg-[#0A66C2]/20 text-[#0A66C2]">
                  <Linkedin size={16} />
                </span>
                LinkedIn Organization / Profile URL
              </label>
              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#0A66C2] hover:underline flex items-center gap-1"
                  title="Test LinkedIn Link"
                >
                  <span>Test Link</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <Input
              name="socialLinkedin"
              value={socials.linkedin}
              onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/mirzabookdepot"
            />
          </div>
        </div>

        {/* Custom Social / Extra Web Links */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Globe size={16} className="text-gold" />
                Additional Custom Social & Web Links
              </h3>
              <p className="text-xs text-muted">
                Add any other custom links (e.g. Threads, Telegram, Goodreads, Pinterest, Blog, etc.).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomLink}
              className="text-xs flex items-center gap-1.5 border-dashed hover:border-gold hover:text-gold"
            >
              <Plus size={14} />
              Add Social Link
            </Button>
          </div>

          {customLinks.length === 0 ? (
            <div className="text-xs text-muted/70 p-4 border border-dashed border-border rounded-lg text-center">
              No custom social links added yet. Click &quot;Add Social Link&quot; above to link other platforms.
            </div>
          ) : (
            <div className="space-y-2.5">
              {customLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-lg border border-border bg-elevated/30"
                >
                  <div className="sm:w-1/3">
                    <Input
                      placeholder="Platform Name (e.g. Telegram)"
                      value={link.platform}
                      onChange={(e) =>
                        handleCustomLinkChange(link.id, "platform", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="https://t.me/mirzabookdepot"
                      value={link.url}
                      onChange={(e) =>
                        handleCustomLinkChange(link.id, "url", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {link.url && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted hover:text-gold transition-colors rounded hover:bg-elevated"
                        title="Preview link"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(link.id)}
                      className="p-2 text-crimson/70 hover:text-crimson transition-colors rounded hover:bg-crimson/10 cursor-pointer"
                      title="Remove custom link"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Store Timings & Operational Schedule */}
      <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <Clock size={22} className="text-gold" />
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
                Store Timings & Operational Schedule
              </h2>
              <p className="text-xs text-muted">
                Configure daily opening and closing hours, days of operation, weekly closed days, and holiday notices.
              </p>
            </div>
          </div>
        </div>

        {/* Timings Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <Input
            label="Daily Opening Time *"
            name="openingTime"
            defaultValue={initialSettings.openingTime || "07:00 AM"}
            placeholder="07:00 AM"
            required
          />
          <Input
            label="Daily Closing Time *"
            name="closingTime"
            defaultValue={initialSettings.closingTime || "09:00 PM"}
            placeholder="09:00 PM"
            required
          />
          <Input
            label="Operating Days Summary *"
            name="operatingDays"
            defaultValue={initialSettings.operatingDays || "Saturday – Thursday"}
            placeholder="Saturday – Thursday"
            required
          />
        </div>

        {/* Closed Days Multi-Select */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Calendar size={14} className="text-gold" />
            Weekly Closed Days (Select all that apply)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {[
              { key: "Monday", label: "Mon" },
              { key: "Tuesday", label: "Tue" },
              { key: "Wednesday", label: "Wed" },
              { key: "Thursday", label: "Thu" },
              { key: "Friday", label: "Fri" },
              { key: "Saturday", label: "Sat" },
              { key: "Sunday", label: "Sun" },
            ].map((day) => {
              const isClosed = Array.isArray(initialSettings.closedDays)
                ? initialSettings.closedDays.includes(day.key)
                : day.key === "Friday";
              return (
                <label
                  key={day.key}
                  className="relative flex items-center justify-between p-3 rounded-lg border border-border bg-elevated/60 hover:bg-elevated cursor-pointer transition-colors group has-[:checked]:border-gold/60 has-[:checked]:bg-gold/10"
                >
                  <span className="text-xs font-semibold text-ink group-hover:text-gold transition-colors">
                    {day.key}
                  </span>
                  <input
                    type="checkbox"
                    name="closedDays"
                    value={day.key}
                    defaultChecked={isClosed}
                    className="w-4 h-4 rounded border-border text-gold focus:ring-gold/30 bg-surface cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-muted italic">
            Checked days will be marked as &quot;Closed&quot; on customer pages and communicated by the AI assistant.
          </p>
        </div>

        {/* Special Notice */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
            Special Holiday / Temporary Closure Notice (Optional)
          </label>
          <textarea
            name="closureNotice"
            defaultValue={initialSettings.closureNotice || ""}
            placeholder="e.g. Closed on Friday for Jumu'ah prayer. Re-opening Saturday at 7:00 AM."
            rows={2}
            className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none"
          />
        </div>
      </div>

      {/* 5. Chatbot Knowledge Base */}
      <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <Bot size={22} className="text-gold" />
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
              Chatbot Knowledge Base
            </h2>
            <p className="text-xs text-muted">
              Context used by the AI assistant to assist customer inquiries regarding return rules, delivery areas, store history, and FAQs.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
            Knowledge Base Content (Markdown Format)
          </label>
          <textarea
            name="chatbotInfo"
            defaultValue={initialChatbotInfo}
            placeholder="# Store Policies..."
            rows={12}
            className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint font-mono leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="sticky bottom-4 z-20 bg-surface/95 backdrop-blur border border-border p-4 rounded-[var(--radius-card)] shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted">
          <CheckCircle size={15} className="text-gold" />
          <span>All changes take immediate effect across public store and API endpoints.</span>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          variant="primary"
          className="px-6 h-11 rounded-[var(--radius-btn)] font-semibold flex items-center gap-2 cursor-pointer shadow-md"
        >
          {isPending ? (
            <>Saving Settings...</>
          ) : (
            <>
              <Save size={16} />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
