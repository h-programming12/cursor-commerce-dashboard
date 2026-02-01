"use client";

import React from "react";
import { cn } from "@/commons/utils/cn";
import { formatPrice } from "@/commons/utils/formatPrice";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { RatingStars } from "../RatingStars/RatingStars";
import { useProductRating } from "@/features/reviews/api/useProductRating";
import type { ProductDetail } from "@/commons/types/product";

export interface ProductInfoSectionProps {
  product: ProductDetail;
  className?: string;
}

export const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({
  product,
  className,
}) => {
  // 별점 및 리뷰 수 조회
  const { data: ratingData } = useProductRating(product.id);

  // 별점 및 리뷰 수 처리
  // useProductRating에서 가져온 데이터를 우선 사용, 없으면 product에서 가져옴
  const rating = ratingData?.rating ?? product.rating ?? 0;
  const reviewCount = ratingData?.reviewCount ?? product.reviewCount ?? 0;

  // 가격 처리
  const currentPrice = product.salePrice ?? product.price;
  const originalPrice = product.salePrice ? product.price : undefined;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  // 카테고리 처리
  const categoryNames =
    product.categories && product.categories.length > 0
      ? product.categories.map((cat) => cat.name).join(", ")
      : null;

  return (
    <div
      className={cn("flex flex-col gap-[24px]", className)}
      role="article"
      aria-label={`Product information for ${product.name}`}
    >
      {/* 별점 및 리뷰 */}
      <div className="flex items-center gap-2">
        <RatingStars
          rating={rating}
          size="medium"
          showRating={false}
          interactive={false}
        />
        <span
          style={{
            fontSize: `${commerceTypography.caption["2"].fontSize}px`,
            lineHeight: commerceTypography.caption["2"].lineHeight,
            fontFamily: commerceTypography.caption["2"].fontFamily,
            fontWeight: commerceTypography.caption["2"].fontWeight,
            color: commerceColors.text.primary,
          }}
        >
          {reviewCount} Reviews
        </span>
      </div>

      {/* 상품명 */}
      <h1
        style={{
          fontSize: `${commerceTypography.headline.h4.fontSize}px`,
          lineHeight: "44px",
          fontFamily: commerceTypography.headline.h4.fontFamily,
          fontWeight: commerceTypography.headline.h4.fontWeight,
          letterSpacing: "-0.4px",
          color: commerceColors.text.primary,
        }}
      >
        {product.name}
      </h1>

      {/* 설명 */}
      {product.description && (
        <p
          style={{
            fontSize: `${commerceTypography.body["2"].fontSize}px`,
            lineHeight: "26px",
            fontFamily: commerceTypography.body["2"].fontFamily,
            fontWeight: commerceTypography.body["2"].fontWeight,
            color: commerceColors.text.tertiary,
          }}
        >
          {product.description}
        </p>
      )}

      {/* 가격 */}
      <div className="flex items-center gap-3">
        <span
          style={{
            fontSize: `${commerceTypography.headline.h6.fontSize}px`,
            lineHeight: commerceTypography.headline.h6.lineHeight,
            fontFamily: commerceTypography.headline.h6.fontFamily,
            fontWeight: commerceTypography.headline.h6.fontWeight,
            color: commerceColors.text.primary,
          }}
        >
          {formatPrice(Math.round(currentPrice))}
        </span>
        {hasDiscount && originalPrice && (
          <span
            style={{
              fontSize: `${commerceTypography.body["1"].fontSize}px`,
              lineHeight: commerceTypography.body["1"].lineHeight,
              fontFamily: commerceTypography.body["1"].fontFamily,
              fontWeight: commerceTypography.body["1"].fontWeight,
              color: commerceColors.text.tertiary,
              textDecoration: "line-through",
            }}
          >
            {formatPrice(Math.round(originalPrice))}
          </span>
        )}
      </div>

      {/* Measurements */}
      {product.measurements && (
        <div className="flex flex-col gap-[8px]">
          <span
            style={{
              fontSize: `${commerceTypography.body["2-semi"].fontSize}px`,
              lineHeight: "26px",
              fontFamily: commerceTypography.body["2-semi"].fontFamily,
              fontWeight: commerceTypography.body["2-semi"].fontWeight,
              color: commerceColors.text.tertiary,
            }}
          >
            Measurements
          </span>
          <span
            style={{
              fontSize: `${commerceTypography.body["1"].fontSize}px`,
              lineHeight: "32px",
              fontFamily: commerceTypography.body["1"].fontFamily,
              fontWeight: commerceTypography.body["1"].fontWeight,
              color: commerceColors.text.primary,
            }}
          >
            {product.measurements}
          </span>
        </div>
      )}

      {/* Category */}
      {categoryNames && (
        <div
          className="flex flex-col gap-[8px] pt-[24px]"
          style={{
            borderTop: `1px solid ${commerceColors.neutral["03"]["100"]}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: `${commerceTypography.caption["2"].fontSize}px`,
                lineHeight: commerceTypography.caption["2"].lineHeight,
                fontFamily: commerceTypography.caption["2"].fontFamily,
                fontWeight: commerceTypography.caption["2"].fontWeight,
                color: commerceColors.text.tertiary,
              }}
            >
              CATEGORY
            </span>
            <span
              style={{
                fontSize: `${commerceTypography.caption["2"].fontSize}px`,
                lineHeight: commerceTypography.caption["2"].lineHeight,
                fontFamily: commerceTypography.caption["2"].fontFamily,
                fontWeight: commerceTypography.caption["2"].fontWeight,
                color: commerceColors.text.primary,
              }}
            >
              {categoryNames}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
