import React from "react";
import Image from "next/image";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { RatingStars } from "../RatingStars/RatingStars";
import { Review } from "../types";

export interface ReviewCardProps {
  review: Review;
  className?: string;
}

export const ReviewCard = React.forwardRef<HTMLDivElement, ReviewCardProps>(
  ({ review, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex gap-4 p-6", className)}
        style={{
          border: `1px solid ${commerceColors.neutral["03"]["100"]}`,
          borderRadius: "8px",
          backgroundColor: commerceColors.background.default,
        }}
        role="article"
        aria-label={`Review by ${review.userName}`}
      >
        {/* 아바타 */}
        <div className="flex-shrink-0">
          {review.userAvatar ? (
            <div
              className="relative overflow-hidden"
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "48px",
              }}
            >
              <Image
                src={review.userAvatar}
                alt={review.userName}
                fill
                className="object-cover"
                sizes="72px"
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "48px",
                backgroundColor: commerceColors.background.light,
              }}
            >
              <span
                style={{
                  fontSize: `${commerceTypography.headline.h7.fontSize}px`,
                  fontFamily: commerceTypography.headline.h7.fontFamily,
                  fontWeight: commerceTypography.headline.h7.fontWeight,
                  color: commerceColors.text.tertiary,
                }}
              >
                {review.userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* 리뷰 내용 */}
        <div className="flex-1 min-w-0">
          {/* 이름과 별점 */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <h4
                style={{
                  fontSize: `${commerceTypography.body["1-semi"].fontSize}px`,
                  lineHeight: `${commerceTypography.body["1-semi"].lineHeight}px`,
                  fontFamily: commerceTypography.body["1-semi"].fontFamily,
                  fontWeight: commerceTypography.body["1-semi"].fontWeight,
                  color: commerceColors.text.primary,
                }}
              >
                {review.userName}
              </h4>
            </div>
            <RatingStars
              rating={review.rating}
              size="small"
              showRating={false}
              interactive={false}
            />
          </div>

          {/* 리뷰 텍스트 */}
          <p
            className="mb-2"
            style={{
              fontSize: `${commerceTypography.body["2"].fontSize}px`,
              lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
              fontFamily: commerceTypography.body["2"].fontFamily,
              fontWeight: commerceTypography.body["2"].fontWeight,
              color: "#353945",
            }}
          >
            {review.comment}
          </p>

          {/* 날짜 */}
          {review.date && (
            <p
              style={{
                fontSize: `${commerceTypography.caption["2"].fontSize}px`,
                lineHeight: `${commerceTypography.caption["2"].lineHeight}px`,
                fontFamily: commerceTypography.caption["2"].fontFamily,
                fontWeight: commerceTypography.caption["2"].fontWeight,
                color: commerceColors.text.tertiary,
              }}
            >
              {review.date}
            </p>
          )}
        </div>
      </div>
    );
  }
);

ReviewCard.displayName = "ReviewCard";

