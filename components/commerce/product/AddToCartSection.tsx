"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import { LikeButton } from "../LikeButton";
import { useCartStore } from "@/commons/store/cart-store";
import { AUTH_URLS } from "@/commons/constants/url";
import type { ProductDetail } from "@/commons/types/product";

export interface AddToCartSectionProps {
  product: ProductDetail;
  initialIsLiked?: boolean;
  className?: string;
}

export const AddToCartSection: React.FC<AddToCartSectionProps> = ({
  product,
  initialIsLiked = false,
  className,
}) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const isSoldOut = product.status === "sold_out";

  const handleAddToCart = () => {
    if (isSoldOut) return;

    try {
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

      // TODO: toast.success(`${product.name}이(가) 장바구니에 추가되었습니다.`);
      // 임시로 alert 사용 (나중에 toast로 교체)
      alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
    } catch (error: unknown) {
      // AuthRequiredError 체크 (필요시)
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "AuthRequiredError"
      ) {
        router.push(AUTH_URLS.LOGIN);
        return;
      }

      // TODO: toast.error("장바구니 추가 중 오류가 발생했습니다.");
      console.error("Add to cart error:", error);
      alert("장바구니 추가 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* 수량 선택 및 위시리스트 버튼 */}
      <div className="flex items-center gap-4">
        {/* QuantitySelector */}
        <QuantitySelector
          value={quantity}
          min={1}
          onChange={setQuantity}
          disabled={isSoldOut}
          size="medium"
        />

        {/* Wishlist 버튼 */}
        <LikeButton
          productId={product.id}
          productName={product.name}
          initialIsLiked={initialIsLiked}
          variant="button"
          disabled={isSoldOut}
        />
      </div>

      {/* Add to Cart 버튼 */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isSoldOut}
        className={cn(
          "flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141718] disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        style={{
          width: "508px",
          height: "52px",
          borderRadius: "8px",
          backgroundColor: commerceColors.neutral["07"]["100"],
          color: commerceColors.text.inverse,
          fontFamily: commerceTypography.button.m.fontFamily,
          fontSize: `${commerceTypography.button.m.fontSize}px`,
          lineHeight: commerceTypography.button.m.lineHeight,
          fontWeight: commerceTypography.button.m.fontWeight,
          letterSpacing: "-0.4px",
        }}
        aria-label={`Add ${product.name} to cart`}
      >
        {isSoldOut ? "Sold Out" : "Add to Cart"}
      </button>

      {/* 재고 상태 메시지 */}
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
  );
};
