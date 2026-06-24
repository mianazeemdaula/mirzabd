// components/store/review-form.tsx
"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReviewFormProps {
  productId: number;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !comment.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Review comment must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/store/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          name: name.trim(),
          email: email.trim(),
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      toast.success("Review submitted successfully! It will be visible once approved.");
      
      // Reset form
      setRating(5);
      setName("");
      setEmail("");
      setTitle("");
      setComment("");
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-surface border border-border p-5 sm:p-6 rounded-[var(--radius-card)]">
      <h3 className="font-display text-lg font-bold text-ink mb-1">Write a Review</h3>
      <p className="text-xs text-muted mb-4">Your email address will not be published. Required fields are marked *</p>

      {/* Star Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Your Rating *
        </label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, idx) => {
            const starValue = idx + 1;
            const isFilled = hoverRating !== null ? starValue <= hoverRating : starValue <= rating;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
                aria-label={`Rate ${starValue} stars`}
              >
                <Star
                  size={24}
                  className={
                    isFilled ? "fill-gold text-gold" : "fill-transparent text-faint"
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name Input */}
        <Input
          label="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />

        {/* Email Input */}
        <Input
          label="Email *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
        />
      </div>

      {/* Title Input */}
      <Input
        label="Review Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Summarize your review in a few words"
      />

      {/* Comment Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Review Comment *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts on the book (min 10 characters)..."
          rows={4}
          required
          className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-faint resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        variant="primary"
        className="w-full sm:w-auto px-6 h-11 rounded-[var(--radius-btn)]"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
export default ReviewForm;
