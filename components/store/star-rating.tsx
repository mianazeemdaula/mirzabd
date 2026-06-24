// components/store/star-rating.tsx
import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}

export function StarRating({
  rating,
  max = 5,
  size = 16,
  className = "",
}: StarRatingProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }).map((_, idx) => {
        const starIndex = idx + 1;
        const isFilled = starIndex <= rating;

        return (
          <Star
            key={idx}
            size={size}
            className={
              isFilled ? "fill-gold text-gold" : "fill-transparent text-faint"
            }
          />
        );
      })}
    </div>
  );
}
export default StarRating;
