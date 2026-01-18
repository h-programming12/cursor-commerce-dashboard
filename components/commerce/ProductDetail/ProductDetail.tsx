"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button } from "@/components/ui/button";
import { RatingStars } from "../RatingStars/RatingStars";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import { useCartStore } from "@/commons/store/cart-store";
import type { ProductDetail as ProductDetailType } from "@/commons/types/product";

export interface ProductDetailProps {
  product: ProductDetailType;
  className?: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  className,
}) => {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const currentPrice = product.salePrice ?? product.price;
  const originalPrice = product.salePrice ? product.price : undefined;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice ?? null,
        imageUrl: product.image_url,
        status: product.status === "sold_out" ? "sold_out" : "visible",
      },
      quantity
    );
  };

  const isSoldOut = product.status === "sold_out";

  return (
    <div
      className={cn("flex flex-col lg:flex-row gap-8", className)}
      role="article"
      aria-label={`Product details for ${product.name}`}
    >
      {/* 이미지 영역 */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: "100%",
          maxWidth: "600px",
          aspectRatio: "1 / 1",
        }}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            priority
            sizes="(max-width: 1024px) 100vw, 600px"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center rounded-lg"
            style={{
              backgroundColor: commerceColors.background.light,
            }}
          >
            <span
              style={{
                fontSize: `${commerceTypography.body["2"].fontSize}px`,
                fontFamily: commerceTypography.body["2"].fontFamily,
                color: commerceColors.text.tertiary,
              }}
            >
              이미지 없음
            </span>
          </div>
        )}
      </div>

      {/* 상품 정보 영역 */}
      <div className="flex-1 flex flex-col gap-6">
        {/* 상품명 */}
        <h1
          style={{
            fontSize: `${commerceTypography.headline.h4.fontSize}px`,
            lineHeight: commerceTypography.headline.h4.lineHeight,
            fontFamily: commerceTypography.headline.h4.fontFamily,
            fontWeight: commerceTypography.headline.h4.fontWeight,
            color: commerceColors.text.primary,
          }}
        >
          {product.name}
        </h1>

        {/* 별점 및 리뷰 */}
        {product.rating !== undefined && (
          <div className="flex items-center gap-2">
            <RatingStars
              rating={product.rating}
              size="medium"
              showRating={true}
              interactive={false}
            />
            {product.reviewCount !== undefined && (
              <span
                style={{
                  fontSize: `${commerceTypography.body["2"].fontSize}px`,
                  lineHeight: commerceTypography.body["2"].lineHeight,
                  fontFamily: commerceTypography.body["2"].fontFamily,
                  fontWeight: commerceTypography.body["2"].fontWeight,
                  color: commerceColors.text.tertiary,
                }}
              >
                ({product.reviewCount} reviews)
              </span>
            )}
          </div>
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
            ${currentPrice.toFixed(2)}
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
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* 설명 */}
        {product.description && (
          <div>
            <h2
              className="mb-2"
              style={{
                fontSize: `${commerceTypography.headline.h7.fontSize}px`,
                lineHeight: commerceTypography.headline.h7.lineHeight,
                fontFamily: commerceTypography.headline.h7.fontFamily,
                fontWeight: commerceTypography.headline.h7.fontWeight,
                color: commerceColors.text.primary,
              }}
            >
              Description
            </h2>
            <p
              style={{
                fontSize: `${commerceTypography.body["2"].fontSize}px`,
                lineHeight: commerceTypography.body["2"].lineHeight,
                fontFamily: commerceTypography.body["2"].fontFamily,
                fontWeight: commerceTypography.body["2"].fontWeight,
                color: commerceColors.text.secondary,
              }}
            >
              {product.description}
            </p>
          </div>
        )}

        {/* 추가 정보 */}
        {product.additional_info && (
          <div>
            <h2
              className="mb-2"
              style={{
                fontSize: `${commerceTypography.headline.h7.fontSize}px`,
                lineHeight: commerceTypography.headline.h7.lineHeight,
                fontFamily: commerceTypography.headline.h7.fontFamily,
                fontWeight: commerceTypography.headline.h7.fontWeight,
                color: commerceColors.text.primary,
              }}
            >
              Additional Information
            </h2>
            <p
              style={{
                fontSize: `${commerceTypography.body["2"].fontSize}px`,
                lineHeight: commerceTypography.body["2"].lineHeight,
                fontFamily: commerceTypography.body["2"].fontFamily,
                fontWeight: commerceTypography.body["2"].fontWeight,
                color: commerceColors.text.secondary,
              }}
            >
              {product.additional_info}
            </p>
          </div>
        )}

        {/* 치수 정보 */}
        {product.measurements && (
          <div>
            <h2
              className="mb-2"
              style={{
                fontSize: `${commerceTypography.headline.h7.fontSize}px`,
                lineHeight: commerceTypography.headline.h7.lineHeight,
                fontFamily: commerceTypography.headline.h7.fontFamily,
                fontWeight: commerceTypography.headline.h7.fontWeight,
                color: commerceColors.text.primary,
              }}
            >
              Measurements
            </h2>
            <p
              style={{
                fontSize: `${commerceTypography.body["2"].fontSize}px`,
                lineHeight: commerceTypography.body["2"].lineHeight,
                fontFamily: commerceTypography.body["2"].fontFamily,
                fontWeight: commerceTypography.body["2"].fontWeight,
                color: commerceColors.text.secondary,
              }}
            >
              {product.measurements}
            </p>
          </div>
        )}

        {/* 수량 선택 및 장바구니 버튼 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
          <QuantitySelector
            value={quantity}
            min={1}
            onChange={setQuantity}
            disabled={isSoldOut}
            size="medium"
          />
          <Button
            variant="primary"
            size="large"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="flex-1 sm:flex-initial"
            style={{ minWidth: "200px" }}
          >
            {isSoldOut ? "Sold Out" : "Add to Cart"}
          </Button>
        </div>

        {/* 재고 상태 */}
        {isSoldOut && (
          <p
            style={{
              fontSize: `${commerceTypography.body["2"].fontSize}px`,
              lineHeight: commerceTypography.body["2"].lineHeight,
              fontFamily: commerceTypography.body["2"].fontFamily,
              fontWeight: commerceTypography.body["2"].fontWeight,
              color: commerceColors.semantic.error,
            }}
          >
            This product is currently out of stock.
          </p>
        )}
      </div>
    </div>
  );
};
