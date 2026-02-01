"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/commons/hooks/useAuth";
import { useProductRating } from "@/features/reviews/api/useProductRating";
import { useCreateReviewMutation } from "@/features/reviews/api/useCreateReviewMutation";
import { ReviewSummaryDisplay } from "./ReviewSummaryDisplay";
import { CustomerReviewsHeader } from "./CustomerReviewsHeader";
import { ReviewForm } from "@/components/commerce/ReviewForm/ReviewForm";
import { ReviewList } from "./ReviewList";
import { AUTH_URLS } from "@/commons/constants/url";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

export interface ProductReviewsSectionProps {
  productId: string;
  className?: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  className,
}) => {
  const { isAuthenticated, currentUserId } = useAuth();
  const { data: ratingData } = useProductRating(productId);
  const createReview = useCreateReviewMutation();

  const rating = ratingData?.rating ?? 0;
  const reviewCount = ratingData?.reviewCount ?? 0;

  const handleSubmitReview = (ratingValue: number, content: string) => {
    if (!currentUserId) return;
    createReview.mutate(
      {
        productId,
        userId: currentUserId,
        rating: ratingValue,
        content,
      },
      {
        onSuccess: () => {
          // mutation invalidates queries; no extra action
        },
      }
    );
  };

  return (
    <div className={className}>
      <ReviewSummaryDisplay className="mb-6" />

      <CustomerReviewsHeader
        rating={rating}
        reviewCount={reviewCount}
        className="mb-6"
      />

      {isAuthenticated && currentUserId ? (
        <div className="mb-8">
          <ReviewForm
            productId={productId}
            userId={currentUserId}
            onSubmit={handleSubmitReview}
            isSubmitting={createReview.isPending}
          />
        </div>
      ) : (
        <div
          className="mb-8 flex items-center justify-between rounded-2xl border px-6 py-4"
          style={{
            height: 72,
            backgroundColor: "var(--commerce-background-paper)",
            borderColor: "var(--commerce-neutral-03-100)",
          }}
        >
          <p
            style={{
              fontSize: commerceTypography.body["2"].fontSize,
              lineHeight: "26px",
              fontFamily: commerceTypography.body["2"].fontFamily,
              fontWeight: commerceTypography.body["2"].fontWeight,
              color: commerceColors.text.tertiary,
            }}
          >
            리뷰를 작성하려면 로그인해 주세요.
          </p>
          <Link
            href={AUTH_URLS.LOGIN}
            className="rounded-[80px] px-6 py-2 font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2"
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
          >
            로그인
          </Link>
        </div>
      )}

      <ReviewList productId={productId} reviewCount={reviewCount} />
    </div>
  );
};
