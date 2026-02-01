"use client";

import React, { useState } from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { RatingStars } from "../RatingStars/RatingStars";

export interface ReviewFormProps {
  productId: string;
  userId: string;
  onSubmit: (rating: number, content: string) => void;
  isSubmitting?: boolean;
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  userId,
  onSubmit,
  isSubmitting = false,
  className,
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;
    onSubmit(rating, content);
    setContent("");
    setRating(0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-4 rounded-2xl border px-6",
        className
      )}
      style={{
        height: 72,
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.neutral["03"]["100"],
      }}
      aria-label="리뷰 작성"
    >
      <RatingStars
        rating={rating}
        size="small"
        interactive
        onRatingChange={setRating}
        showRating={false}
        className="shrink-0"
      />
      <input
        type="text"
        placeholder="Share your thoughts"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--commerce-text-tertiary) focus:outline-none"
        style={{
          fontSize: commerceTypography.body["2"].fontSize,
          lineHeight: "26px",
          fontFamily: commerceTypography.body["2"].fontFamily,
          fontWeight: commerceTypography.body["2"].fontWeight,
          color: commerceColors.text.primary,
        }}
        aria-label="리뷰 내용"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={rating < 1 || isSubmitting}
        className={cn(
          "shrink-0 rounded-[80px] px-6 font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 disabled:opacity-50"
        )}
        style={{
          height: 40,
          backgroundColor: commerceColors.neutral["07"]["100"],
          fontSize: commerceTypography.button.m.fontSize,
          fontFamily: commerceTypography.button.m.fontFamily,
          fontWeight: commerceTypography.button.m.fontWeight,
          lineHeight: "28px",
          letterSpacing: "-0.4px",
          color: commerceColors.text.inverse,
        }}
        aria-label="리뷰 작성 제출"
      >
        Write Review
      </button>
    </form>
  );
};
