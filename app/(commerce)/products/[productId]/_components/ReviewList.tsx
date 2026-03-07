"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ReviewCard } from "@/components/commerce/ReviewCard/ReviewCard";
import {
  useProductReviewsList,
  type ProductReviewsInitialPage,
} from "@/features/reviews/api/useProductReviewsList";
import { useAuth } from "@/commons/hooks/useAuth";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

export interface ReviewListProps {
  productId: string;
  reviewCount: number;
  onReviewsChange?: () => void;
  className?: string;
  /** 서버에서 미리 로드한 첫 페이지 */
  initialPage?: ProductReviewsInitialPage;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  reviewCount,
  onReviewsChange,
  className,
  initialPage,
}) => {
  const {
    reviews,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
    refetch,
  } = useProductReviewsList(productId, initialPage);
  const { currentUserId } = useAuth();
  const router = useRouter();

  const handleReviewsChange = () => {
    refetch();
    if (onReviewsChange) {
      onReviewsChange();
    } else {
      router.refresh();
    }
  };

  const uniqueReviews = useMemo(() => {
    const seen = new Set<string>();
    return reviews.filter((review) => {
      if (seen.has(review.id)) return false;
      seen.add(review.id);
      return true;
    });
  }, [reviews]);

  if (isLoading) {
    return (
      <div className={className}>
        <p
          style={{
            fontSize: commerceTypography.body["2"].fontSize,
            color: commerceColors.text.tertiary,
          }}
        >
          리뷰를 불러오는 중...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        <p
          style={{
            fontSize: commerceTypography.body["2"].fontSize,
            color: commerceColors.semantic.error,
          }}
        >
          리뷰를 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h4
        className="mb-6"
        style={{
          fontFamily: commerceTypography.headline.h6.fontFamily,
          fontWeight: commerceTypography.headline.h6.fontWeight,
          fontSize: 28,
          lineHeight: "34px",
          letterSpacing: "-0.6px",
          color: commerceColors.text.primary,
        }}
      >
        {reviewCount} Reviews
      </h4>
      <ul className="flex flex-col gap-4" aria-label="리뷰 목록">
        {uniqueReviews.map((review) => (
          <li key={review.id}>
            <ReviewCard
              review={review}
              productId={productId}
              currentUserId={currentUserId}
              onDeleted={handleReviewsChange}
              onUpdated={handleReviewsChange}
            />
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-[80px] border-2 px-6 py-2 font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 disabled:opacity-50"
            style={{
              borderColor: commerceColors.neutral["07"]["100"],
              fontSize: commerceTypography.button.m.fontSize,
              fontFamily: commerceTypography.button.m.fontFamily,
              fontWeight: commerceTypography.button.m.fontWeight,
              lineHeight: "28px",
              letterSpacing: "-0.4px",
              color: commerceColors.neutral["07"]["100"],
            }}
            aria-label="더 많은 리뷰 불러오기"
          >
            {isFetchingNextPage ? "불러오는 중..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};
