"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from "@/lib/constants";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedule, setSchedule] = useState({
    openingTime: DEFAULT_OPENING_TIME,
    closingTime: DEFAULT_CLOSING_TIME,
    operatingDays: DEFAULT_OPERATING_DAYS,
    closedDays: DEFAULT_CLOSED_DAYS,
    closureNotice: "",
  });

  useEffect(() => {
    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSchedule({
            openingTime: data.openingTime || DEFAULT_OPENING_TIME,
            closingTime: data.closingTime || DEFAULT_CLOSING_TIME,
            operatingDays: data.operatingDays || DEFAULT_OPERATING_DAYS,
            closedDays: Array.isArray(data.closedDays) ? data.closedDays : DEFAULT_CLOSED_DAYS,
            closureNotice: data.closureNotice || "",
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
    // Simulate API request
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Thank you! Your message has been sent successfully.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Have questions about book availability, custom orders, or shipping? Contact the team at {APP_NAME}. We are here to help you turn the next page.
        </motion.p>
      </motion.div>

      {/* Grid: Details & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Side: Contact Details */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.08, 0.1)}
          className="lg:col-span-5 space-y-8"
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
                  <p className="text-sm text-muted mt-1 leading-relaxed">{APP_ADDRESS}</p>
                </div>
              </div>

              {/* Phones */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-void text-gold border border-border flex-shrink-0 mt-0.5">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Phone Numbers</h3>
                  <div className="flex flex-col text-sm text-muted mt-1 space-y-1">
                    <a href={`tel:${APP_CONTACT}`} className="hover:text-gold transition-colors">
                      {APP_CONTACT} <span className="text-xs text-faint ml-1">(Mobile / WhatsApp)</span>
                    </a>
                    <a href={`tel:${APP_LANDLINE}`} className="hover:text-gold transition-colors">
                      {APP_LANDLINE} <span className="text-xs text-faint ml-1">(Landline)</span>
                    </a>
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
                    href={`mailto:${APP_EMAIL}`}
                    className="text-sm text-muted hover:text-gold transition-colors mt-1 block"
                  >
                    {APP_EMAIL}
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

          {/* Quick Notice */}
          <motion.div
            variants={fadeUp}
            className="bg-gold-glow/5 border border-gold/20 rounded-[var(--radius-card)] p-5 flex gap-3 text-sm text-gold"
          >
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Need instant assistance?</p>
              <p className="text-ink/80 mt-1">
                Reach out via WhatsApp or call our mobile number directly for immediate queries on book status and local deliveries.
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
              src="https://maps.google.com/maps?q=Mirza%20Plaza,%20Depalpur,%20Pakistan&t=&z=16&ie=UTF8&iwloc=&output=embed"
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
