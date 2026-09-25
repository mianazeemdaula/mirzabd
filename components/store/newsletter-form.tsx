// components/store/newsletter-form.tsx
"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing!");
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        required
        aria-label="Email address"
        className="flex-grow h-11 rounded-xl bg-white px-4 text-sm text-[#0F1B35] placeholder:text-[#8A96AC] focus:outline-none focus:ring-4 focus:ring-azure/40"
      />
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber px-6 text-sm font-bold text-[#1F1300] transition-colors hover:bg-[#FFB93F] cursor-pointer"
      >
        Subscribe <Send size={15} />
      </button>
    </form>
  );
}

export default NewsletterForm;
