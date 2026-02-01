"use client";

import React from "react";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

export interface CustomerReviewsHeaderProps {
  rating: number;
  reviewCount: number;
  className?: string;
}

export const CustomerReviewsHeader: React.FC<CustomerReviewsHeaderProps> = ({
  rating,
  reviewCount,
  className,
}) => {
  return (
    <div className={className}>
      <h3
        className="mb-4"
        style={{
          fontFamily: commerceTypography.headline.h6.fontFamily,
          fontWeight: commerceTypography.headline.h6.fontWeight,
          fontSize: 28,
          lineHeight: "34px",
          letterSpacing: "-0.6px",
          color: commerceColors.neutral["05"]["100"],
        }}
      >
        Customer Reviews
      </h3>
      <div className="flex items-center gap-2">
        <RatingStars
          rating={rating}
          size="small"
          showRating={false}
          interactive={false}
        />
        <span
          style={{
            fontSize: commerceTypography.caption["2"].fontSize,
            lineHeight: "20px",
            fontFamily: commerceTypography.caption["2"].fontFamily,
            fontWeight: commerceTypography.caption["2"].fontWeight,
            color: commerceColors.neutral["07"]["100"],
          }}
        >
          {reviewCount} Reviews
        </span>
      </div>
    </div>
  );
};
