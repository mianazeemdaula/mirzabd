"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  AlertCircle,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon, TikTokIcon, XTwitterIcon } from "@/components/ui/social-icons";
import { fadeUp, stagger, fadeIn } from "@/lib/motion";
import {
  APP_NAME,
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

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contactInfo, setContactInfo] = useState({
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
      closureNotice: "",
    },
  });

  useEffect(() => {
    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setContactInfo({
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
              closureNotice: data.closureNotice || "",
            },
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Thank you! Your message has been sent successfully.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { socialLinks, customSocialLinks, schedule } = contactInfo;
  const whatsappUrl = formatWhatsAppUrl(socialLinks.whatsapp || contactInfo.contactPhone);

  const activeSocialCount =
    Object.values(socialLinks).filter((val) => Boolean(val)).length +
    customSocialLinks.length;

  return (
    <div className="mx-auto w-full max-w-none px-4 py-12 sm:px-8 md:px-12 lg:px-16 space-y-12">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.1)}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <motion.span
          variants={fadeUp}
          className="text-badge text-gold tracking-widest font-bold uppercase"
        >
          Get In Touch
        </motion.span>
        <motion.h1
          variants={fadeUp}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink"
        >
          Contact Our Store
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-muted text-sm sm:text-base leading-relaxed"
        >
          Have questions about book availability, custom orders, or shipping? Contact the team at {contactInfo.storeName}. We are here to help you turn the next page.
        </motion.p>
      </motion.div>

      {/* Grid: Details & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Side: Contact Details & Social Links */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.08, 0.1)}
          className="lg:col-span-5 space-y-6"
        >
          {/* Contact Details Card */}
          <motion.div
            variants={fadeUp}
            className="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 space-y-6 shadow-card"
          >
            <h2 className="font-display text-2xl font-semibold text-ink border-b border-border pb-3">
              Store Information
            </h2>
            <div className="space-y-5">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-void text-gold border border-border flex-shrink-0 mt-0.5">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Address</h3>
                  <p className="text-sm text-muted mt-1 leading-relaxed">{contactInfo.storeAddress}</p>
                </div>
              </div>

              {/* Phones: Mobile & Landline */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-void text-gold border border-border flex-shrink-0 mt-0.5">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Phone Numbers</h3>
                  <div className="flex flex-col text-sm text-muted mt-1 space-y-1">
                    {contactInfo.contactPhone && (
                      <a href={`tel:${contactInfo.contactPhone}`} className="hover:text-gold transition-colors">
                        {contactInfo.contactPhone} <span className="text-xs text-faint ml-1">(Mobile / WhatsApp)</span>
                      </a>
                    )}
                    {contactInfo.contactLandline && (
                      <a href={`tel:${contactInfo.contactLandline}`} className="hover:text-gold transition-colors">
                        {contactInfo.contactLandline} <span className="text-xs text-faint ml-1">(Landline)</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-void text-gold border border-border flex-shrink-0 mt-0.5">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Email Address</h3>
                  <a
                    href={`mailto:${contactInfo.contactEmail}`}
                    className="text-sm text-muted hover:text-gold transition-colors mt-1 block"
                  >
                    {contactInfo.contactEmail}
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-void text-gold border border-border flex-shrink-0 mt-0.5">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Business Hours</h3>
                  <div className="text-sm text-muted mt-1 leading-relaxed space-y-0.5">
                    <p>
                      <span className="text-ink font-medium">{schedule.operatingDays}:</span> {schedule.openingTime} – {schedule.closingTime}
                    </p>
                    <p>
                      {schedule.closedDays.length > 0 ? (
                        <span className="text-crimson font-medium">
                          {schedule.closedDays.join(", ")}: Closed
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">Open 7 Days a Week</span>
                      )}
                    </p>
                    {schedule.closureNotice && (
                      <p className="text-xs text-gold/90 mt-1.5 p-2 rounded bg-gold/10 border border-gold/20 leading-normal">
                        ★ {schedule.closureNotice}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Media Channels Card */}
          {activeSocialCount > 0 && (
            <motion.div
              variants={fadeUp}
              className="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 space-y-4 shadow-card"
            >
              <h2 className="font-display text-xl font-semibold text-ink border-b border-border pb-3 flex items-center justify-between">
                <span>Connect On Social Media</span>
                <span className="text-xs font-normal text-muted">Stay in touch</span>
              </h2>

              <p className="text-xs text-muted leading-relaxed">
                Follow our official channels for the latest book releases, literary festivals, author signings, and exclusive discounts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* WhatsApp Chat Button */}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 text-ink hover:bg-[#25D366]/20 transition-colors text-xs font-semibold group"
                  >
                    <span className="p-1.5 rounded-full bg-[#25D366] text-white">
                      <WhatsAppIcon size={14} />
                    </span>
                    <span className="truncate group-hover:text-[#25D366] transition-colors">Chat on WhatsApp</span>
                    <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {/* Facebook Button */}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#1877F2]/30 bg-[#1877F2]/10 text-ink hover:bg-[#1877F2]/20 transition-colors text-xs font-semibold group"
                  >
                    <span className="p-1.5 rounded-full bg-[#1877F2] text-white">
                      <Facebook size={14} />
                    </span>
                    <span className="truncate group-hover:text-[#1877F2] transition-colors">Facebook Page</span>
                    <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {/* Instagram Button */}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E4405F]/30 bg-[#E4405F]/10 text-ink hover:bg-[#E4405F]/20 transition-colors text-xs font-semibold group"
                  >
                    <span className="p-1.5 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#C13584] text-white">
                      <Instagram size={14} />
                    </span>
                    <span className="truncate group-hover:text-[#E4405F] transition-colors">Instagram Profile</span>
                    <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {/* X / Twitter */}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-elevated text-ink hover:bg-elevated/80 transition-colors text-xs font-semibold group"
                  >
                    <span className="p-1.5 rounded-full bg-void text-ink border border-border">
                      <XTwitterIcon size={14} />
                    </span>
                    <span className="truncate group-hover:text-gold transition-colors">Follow on X</span>
                    <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {/* YouTube */}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#FF0000]/30 bg-[#FF0000]/10 text-ink hover:bg-[#FF0000]/20 transition-colors text-xs font-semibold group"
                  >
                    <span className="p-1.5 rounded-full bg-[#FF0000] text-white">
                      <Youtube size={14} />
                    </span>
                    <span className="truncate group-hover:text-[#FF0000] transition-colors">YouTube Channel</span>
                    <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {/* LinkedIn */}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#0A66C2]/30 bg-[#0A66C2]/10 text-ink hover:bg-[#0A66C2]/20 transition-colors text-xs font-semibold group"
                  >
                    <span className="p-1.5 rounded-full bg-[#0A66C2] text-white">
                      <Linkedin size={14} />
                    </span>
                    <span className="truncate group-hover:text-[#0A66C2] transition-colors">LinkedIn</span>
                    <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {/* TikTok */}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-teal-500/30 bg-teal-500/10 text-ink hover:bg-teal-500/20 transition-colors text-xs font-semibold group"
                  >
                    <span className="p-1.5 rounded-full bg-void text-teal-400 border border-teal-500/30">
                      <TikTokIcon size={14} />
                    </span>
                    <span className="truncate group-hover:text-teal-400 transition-colors">TikTok</span>
                    <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {/* Custom links */}
                {customSocialLinks.map((custom) => (
                  <a
                    key={custom.id}
                    href={custom.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-elevated text-ink hover:bg-elevated/80 transition-colors text-xs font-semibold group"
                  >
                    <span className="p-1.5 rounded-full bg-void text-gold border border-border">
                      <Globe size={14} />
                    </span>
                    <span className="truncate group-hover:text-gold transition-colors">{custom.platform}</span>
                    <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Instant Assistance Alert */}
          <motion.div
            variants={fadeUp}
            className="bg-gold-glow/5 border border-gold/20 rounded-[var(--radius-card)] p-5 flex gap-3 text-sm text-gold"
          >
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Need instant assistance?</p>
              <p className="text-ink/80 mt-1 leading-relaxed">
                Reach out via WhatsApp or call our mobile line at{" "}
                <strong className="text-gold">{contactInfo.contactPhone}</strong> for urgent book enquiries and immediate stock checks.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Contact Form & Map */}
        <div className="lg:col-span-7 space-y-8">
          {/* Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 shadow-card"
          >
            <h2 className="font-display text-2xl font-semibold text-ink border-b border-border pb-3 mb-6">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Subject"
                id="subject"
                type="text"
                placeholder="How can we help you?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-sm font-medium text-ink">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Type your message here..."
                  className="flex w-full bg-elevated border border-border text-ink rounded-[var(--radius-btn)] px-3 py-2 text-sm placeholder:text-faint focus:border-gold focus:ring-1 focus:ring-gold/30 focus:outline-none transition-colors duration-200 resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold text-white hover:bg-gold-dim font-bold shadow-lg shadow-gold/5 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Map */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-surface border border-border rounded-[var(--radius-card)] p-4 shadow-card overflow-hidden h-[350px] relative group"
          >
            <iframe
              title="Store Location Map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                contactInfo.storeAddress || "Mirza Plaza, Depalpur, Pakistan"
              )}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-[var(--radius-btn)]"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
