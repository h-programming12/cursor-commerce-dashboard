"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import { useCartStore } from "@/commons/store/cart-store";
import { AUTH_URLS } from "@/commons/constants/url";
import type { ProductDetail } from "@/commons/types/product";

export interface AddToCartSectionProps {
  product: ProductDetail;
  initialIsLiked?: boolean;
  className?: string;
}

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
      fill={filled ? commerceColors.semantic.error : "none"}
      stroke={
        filled ? commerceColors.semantic.error : commerceColors.text.primary
      }
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AddToCartSection: React.FC<AddToCartSectionProps> = ({
  product,
  initialIsLiked = false,
  className,
}) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(initialIsLiked);
  const [isPending, setIsPending] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // initialIsLiked 변경 시 동기화
  useEffect(() => {
    setIsWishlisted(initialIsLiked);
  }, [initialIsLiked]);

  const isSoldOut = product.status === "sold_out";

  const handleWishlistToggle = async () => {
    if (isPending) return;

    // Optimistic UI 업데이트
    setIsWishlisted((prev) => !prev);
    setIsPending(true);

    try {
      // TODO: 추후에 찜하기 API 호출 구현
      // const response = await toggleWishlist(product.id);
      // setIsWishlisted(response.isLiked);
    } catch (error) {
      // 에러 발생 시 원래 상태로 복구
      setIsWishlisted((prev) => !prev);
      // TODO: toast.error("찜하기 처리 중 오류가 발생했습니다.");
      console.error("Wishlist toggle error:", error);
    } finally {
      setIsPending(false);
    }
  };

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
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isPending || isSoldOut}
          className={cn(
            "flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141718] disabled:opacity-50 disabled:cursor-not-allowed",
            isPending && "opacity-50 cursor-wait"
          )}
          style={{
            width: "357px",
            height: "52px",
            borderRadius: "8px",
            border: `1px solid ${commerceColors.text.primary}`,
            backgroundColor: "transparent",
            fontFamily: commerceTypography.button.m.fontFamily,
            fontSize: `${commerceTypography.button.m.fontSize}px`,
            lineHeight: commerceTypography.button.m.lineHeight,
            fontWeight: commerceTypography.button.m.fontWeight,
            letterSpacing: "-0.4px",
            color: commerceColors.text.primary,
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon filled={isWishlisted} />
          <span>Wishlist</span>
        </button>
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
