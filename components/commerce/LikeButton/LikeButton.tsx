"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { toggleLikeItem } from "@/app/(commerce)/likes/actions";
import { AUTH_URLS } from "@/commons/constants/url";

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
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

export interface LikeButtonProps {
  productId: string;
  productName?: string;
  initialIsLiked: boolean;
  variant?: "icon" | "button";
  disabled?: boolean;
  className?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  productId,
  productName,
  initialIsLiked = false,
  variant = "button",
  disabled = false,
  className,
}) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const handleClick = async () => {
    if (isPending || disabled) return;

    const previous = isLiked;
    setIsLiked(!previous);
    setIsPending(true);

    try {
      const result = await toggleLikeItem(productId);

      if (!result.success) {
        setIsLiked(previous);
        if (result.code === "AUTH_REQUIRED") {
          toast.error(result.message);
          router.push(AUTH_URLS.LOGIN);
        } else {
          toast.error(result.message);
        }
        return;
      }

      setIsLiked(result.isLiked);
      if (result.isLiked) {
        toast.success(
          productName
            ? `${productName}을(를) 찜 목록에 추가했습니다.`
            : "찜 목록에 추가했습니다."
        );
      } else {
        toast.success(
          productName
            ? `${productName}을(를) 찜 목록에서 제거했습니다.`
            : "찜 목록에서 제거했습니다."
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  const isIconOnly = variant === "icon";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || disabled}
      className={cn(
        "flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141718] disabled:opacity-50 disabled:cursor-not-allowed",
        isIconOnly &&
          "rounded-full bg-(--commerce-background-default) hover:scale-110",
        isPending && "opacity-50 cursor-wait",
        className
      )}
      style={
        isIconOnly
          ? { width: "32px", height: "32px", borderRadius: "32px" }
          : {
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
            }
      }
      aria-label={isLiked ? "찜 목록에서 제거" : "찜 목록에 추가"}
      aria-busy={isPending}
    >
      <HeartIcon filled={isLiked} />
      {!isIconOnly && <span>Wishlist</span>}
    </button>
  );
};
