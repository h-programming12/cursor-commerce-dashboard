import { AccountPagination } from "@/components/commerce/AccountPagination/AccountPagination";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import type { Review } from "@/components/commerce/types";
import { MyReviewsEmptyState } from "./MyReviewsEmptyState";
import { MyReviewListItem, type MyReviewItem } from "./MyReviewListItem";

export interface MyReviewsSectionProps {
  reviews: MyReviewItem[];
  totalPages: number;
  currentPage: number;
  currentUserId: string;
}

export function MyReviewsSection({
  reviews,
  totalPages,
  currentPage,
  currentUserId,
}: MyReviewsSectionProps) {
  const hasReviews = reviews.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <h2
        style={{
          fontSize: commerceTypography.headline.h7.fontSize,
          lineHeight: "32px",
          fontFamily: commerceTypography.headline.h7.fontFamily,
          fontWeight: 600,
          color: commerceColors.text.primary,
        }}
      >
        Reviews
      </h2>

      {!hasReviews ? (
        <MyReviewsEmptyState />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {reviews.map((item) => (
              <MyReviewListItem
                key={item.review.id}
                item={item}
                currentUserId={currentUserId}
              />
            ))}
          </div>
          <AccountPagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={ACCOUNT_URLS.REVIEWS}
          />
        </>
      )}
    </div>
  );
}
