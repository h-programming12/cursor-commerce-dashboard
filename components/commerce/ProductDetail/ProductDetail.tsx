"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ProductInfoSection } from "../product/ProductInfoSection";
import { AddToCartSection } from "../product/AddToCartSection";
import type { ProductDetail as ProductDetailType } from "@/commons/types/product";

export interface ProductDetailProps {
  product: ProductDetailType;
  initialIsLiked?: boolean;
  className?: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  initialIsLiked = false,
  className,
}) => {
  return (
    <div
      className={cn("flex flex-col lg:flex-row gap-8", className)}
      role="article"
      aria-label={`Product details for ${product.name}`}
    >
      {/* 이미지 영역 */}
      <div
        className="relative shrink-0"
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
        {/* 상품 정보 섹션 */}
        <ProductInfoSection product={product} />
        {/* 장바구니 추가 섹션 */}
        <AddToCartSection product={product} initialIsLiked={initialIsLiked} />
      </div>
    </div>
  );
};
