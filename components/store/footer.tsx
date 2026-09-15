// components/store/footer.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  Send,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { WhatsAppIcon, TikTokIcon, XTwitterIcon } from "@/components/ui/social-icons";
import {
  APP_NAME,
  APP_TAGLINE,
  APP_ADDRESS,
  APP_CONTACT,
  APP_LANDLINE,
  APP_EMAIL,
  DEFAULT_OPENING_TIME,
  DEFAULT_CLOSING_TIME,
  DEFAULT_OPERATING_DAYS,
  DEFAULT_CLOSED_DAYS,
  SOCIAL_LINKS,
} from "@/lib/constants";
import { formatWhatsAppUrl, CustomSocialLink } from "@/actions/settings";
import { Logo } from "@/components/store/logo";

export function Footer() {
  const [email, setEmail] = useState("");
  const [storeInfo, setStoreInfo] = useState({
    storeName: APP_NAME,
    storeAddress: APP_ADDRESS,
    contactPhone: APP_CONTACT,
    contactLandline: APP_LANDLINE,
    contactEmail: APP_EMAIL,
    socialLinks: {
      facebook: SOCIAL_LINKS.facebook,
      instagram: SOCIAL_LINKS.instagram,
      whatsapp: SOCIAL_LINKS.whatsapp,
      twitter: "",
      youtube: "",
      linkedin: "",
      tiktok: "",
    },
    customSocialLinks: [] as CustomSocialLink[],
    schedule: {
      openingTime: DEFAULT_OPENING_TIME,
      closingTime: DEFAULT_CLOSING_TIME,
      operatingDays: DEFAULT_OPERATING_DAYS,
      closedDays: DEFAULT_CLOSED_DAYS,
    },
  });

  useEffect(() => {
    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setStoreInfo({
            storeName: data.storeName || APP_NAME,
            storeAddress: data.storeAddress || APP_ADDRESS,
            contactPhone: data.contactPhone || APP_CONTACT,
            contactLandline: data.contactLandline || APP_LANDLINE,
            contactEmail: data.contactEmail || APP_EMAIL,
            socialLinks: {
              facebook: data.socialLinks?.facebook ?? SOCIAL_LINKS.facebook,
              instagram: data.socialLinks?.instagram ?? SOCIAL_LINKS.instagram,
              whatsapp: data.socialLinks?.whatsapp ?? SOCIAL_LINKS.whatsapp,
              twitter: data.socialLinks?.twitter || "",
              youtube: data.socialLinks?.youtube || "",
              linkedin: data.socialLinks?.linkedin || "",
              tiktok: data.socialLinks?.tiktok || "",
            },
            customSocialLinks: Array.isArray(data.customSocialLinks)
              ? data.customSocialLinks
              : [],
            schedule: {
              openingTime: data.openingTime || DEFAULT_OPENING_TIME,
              closingTime: data.closingTime || DEFAULT_CLOSING_TIME,
              operatingDays: data.operatingDays || DEFAULT_OPERATING_DAYS,
              closedDays: Array.isArray(data.closedDays)
                ? data.closedDays
                : DEFAULT_CLOSED_DAYS,
            },
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success(`Thank you for subscribing to ${storeInfo.storeName} newsletter!`);
    setEmail("");
  };

  const { socialLinks, customSocialLinks, schedule } = storeInfo;

  return (
    <footer className="w-full bg-surface border-t border-border mt-auto">
      <div className="mx-auto w-full max-w-none px-4 py-12 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-4">
            <Logo size="md" href="/" />
            <p className="text-sm font-medium italic text-gold">{APP_TAGLINE}</p>

            <div className="space-y-3 pt-2 text-sm text-muted">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-gold" />
                <span className="leading-relaxed">{storeInfo.storeAddress}</span>
              </div>

              {/* Phone Numbers: Mobile & Landline */}
              <div className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 flex-shrink-0 text-gold" />
                <div className="flex flex-col space-y-0.5">
                  {storeInfo.contactPhone && (
                    <a
                      href={`tel:${storeInfo.contactPhone}`}
                      className="hover:text-gold transition-colors"
                      title="Call Mobile / WhatsApp"
                    >
                      {storeInfo.contactPhone} <span className="text-xs text-muted/70">(Mobile)</span>
                    </a>
                  )}
                  {storeInfo.contactLandline && (
                    <a
                      href={`tel:${storeInfo.contactLandline}`}
                      className="hover:text-gold transition-colors"
                      title="Call Office Landline"
                    >
                      {storeInfo.contactLandline} <span className="text-xs text-muted/70">(Landline)</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-gold" />
                <a
                  href={`mailto:${storeInfo.contactEmail}`}
                  className="hover:text-gold transition-colors break-all"
                >
                  {storeInfo.contactEmail}
                </a>
              </div>

              {/* Hours / Schedule */}
              <div className="flex items-start gap-2">
                <Clock size={16} className="mt-1 flex-shrink-0 text-gold" />
                <div className="flex flex-col text-xs leading-relaxed">
                  <span className="text-ink/90 font-medium">
                    {schedule.operatingDays}: {schedule.openingTime} – {schedule.closingTime}
                  </span>
                  {schedule.closedDays.length > 0 ? (
                    <span className="text-crimson font-medium">
                      {schedule.closedDays.join(", ")}: Closed
                    </span>
                  ) : (
                    <span className="text-emerald-400">Open Daily</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Social Icons Strip */}
            <div className="pt-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-muted block mb-2">
                Connect With Us
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {/* WhatsApp */}
                {socialLinks.whatsapp && (
                  <a
                    href={formatWhatsAppUrl(socialLinks.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white transition-transform hover:scale-110 p-2 rounded-full bg-[#25D366] shadow-sm flex items-center justify-center"
                    aria-label="Chat on WhatsApp"
                    title="WhatsApp"
                  >
                    <WhatsAppIcon size={16} />
                  </a>
                )}

                {/* Facebook */}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white transition-transform hover:scale-110 p-2 rounded-full bg-[#1877F2] shadow-sm flex items-center justify-center"
                    aria-label="Mirza Book Depot on Facebook"
                    title="Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                )}

                {/* Instagram */}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white transition-transform hover:scale-110 p-2 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#C13584] shadow-sm flex items-center justify-center"
                    aria-label="Mirza Book Depot on Instagram"
                    title="Instagram"
                  >
                    <Instagram size={16} />
                  </a>
                )}

                {/* X / Twitter */}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink hover:text-gold transition-transform hover:scale-110 p-2 rounded-full bg-elevated border border-border shadow-sm flex items-center justify-center"
                    aria-label="Follow us on X"
                    title="X / Twitter"
                  >
                    <XTwitterIcon size={16} />
                  </a>
                )}

                {/* YouTube */}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white transition-transform hover:scale-110 p-2 rounded-full bg-[#FF0000] shadow-sm flex items-center justify-center"
                    aria-label="Watch us on YouTube"
                    title="YouTube"
                  >
                    <Youtube size={16} />
                  </a>
                )}

                {/* LinkedIn */}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white transition-transform hover:scale-110 p-2 rounded-full bg-[#0A66C2] shadow-sm flex items-center justify-center"
                    aria-label="Connect on LinkedIn"
                    title="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                )}

                {/* TikTok */}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink hover:text-teal-400 transition-transform hover:scale-110 p-2 rounded-full bg-elevated border border-border shadow-sm flex items-center justify-center"
                    aria-label="Follow us on TikTok"
                    title="TikTok"
                  >
                    <TikTokIcon size={16} />
                  </a>
                )}

                {/* Custom Links */}
                {customSocialLinks.map((custom) => (
                  <a
                    key={custom.id}
                    href={custom.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink hover:text-gold transition-transform hover:scale-110 p-2 rounded-full bg-elevated border border-border shadow-sm flex items-center justify-center"
                    aria-label={custom.platform}
                    title={custom.platform}
                  >
                    <Globe size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-gold transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-gold transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-gold transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/products?category=fiction" className="hover:text-gold transition-colors">
                  Fiction
                </Link>
              </li>
              <li>
                <Link href="/products?category=non-fiction" className="hover:text-gold transition-colors">
                  Non-Fiction
                </Link>
              </li>
              <li>
                <Link href="/products?category=urdu-literature" className="hover:text-gold transition-colors">
                  Urdu Literature
                </Link>
              </li>
              <li>
                <Link href="/products?category=islamic-books" className="hover:text-gold transition-colors">
                  Islamic Books
                </Link>
              </li>
              <li>
                <Link href="/products?category=self-help-philosophy" className="hover:text-gold transition-colors">
                  Self Help & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/products?category=childrens-books" className="hover:text-gold transition-colors">
                  Children&apos;s Books
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Subscribe to receive weekly updates on newly stocked titles, literary blogs, and special promotions.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 pl-3 pr-10 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-faint"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-[var(--radius-btn)] bg-gold hover:bg-gold-dim text-white transition-colors cursor-pointer"
                  aria-label="Subscribe button"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <hr className="my-8 border-border" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} {storeInfo.storeName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
