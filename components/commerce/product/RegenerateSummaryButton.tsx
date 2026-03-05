"use client";

import React, { useTransition } from "react";
import toast from "react-hot-toast";
import { FiRefreshCw } from "react-icons/fi";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import {
  generateAiReviewSummary,
  type GenerateSummaryResult,
} from "@/app/(commerce)/products/[productId]/review-summary-actions";

export interface RegenerateSummaryButtonProps {
  productId: string;
  isAdmin?: boolean;
  onRegenerated?: () => void;
  className?: string;
}

export const RegenerateSummaryButton: React.FC<
  RegenerateSummaryButtonProps
> = ({ productId, isAdmin, onRegenerated, className }) => {
  const [isPending, startTransition] = useTransition();

  if (!isAdmin) {
    return null;
  }

  const handleClick = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result: GenerateSummaryResult = await generateAiReviewSummary(
          productId
        );

        if (result.success) {
          toast.success("AI 리뷰 요약이 생성되었습니다.");
          onRegenerated?.();
        } else {
          switch (result.code) {
            case "AUTH_REQUIRED":
              toast.error("AI 리뷰 요약은 관리자만 생성할 수 있습니다.");
              break;
            case "NO_REVIEWS":
              toast.error("요약을 생성할 리뷰가 없습니다.");
              break;
            case "AI_ERROR":
              toast.error("AI 리뷰 요약 생성에 실패했습니다.");
              break;
            case "DB_ERROR":
              toast.error("리뷰 요약 저장에 실패했습니다.");
              break;
            default:
              toast.error(
                result.error || "AI 리뷰 요약 생성 중 오류가 발생했습니다."
              );
          }
        }
      } catch {
        toast.error("AI 리뷰 요약 생성 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 6,
        paddingBottom: 6,
        borderRadius: 9999,
        border: `1px solid ${commerceColors.neutral["04"]["100"]}`,
        backgroundColor: commerceColors.background.default,
        color: commerceColors.text.secondary,
        fontSize: commerceTypography.caption["2"].fontSize,
        lineHeight: commerceTypography.caption["2"].lineHeight,
        fontFamily: commerceTypography.caption["2"].fontFamily,
        fontWeight: commerceTypography.caption["2"].fontWeight,
        cursor: isPending ? "default" : "pointer",
        opacity: isPending ? 0.7 : 1,
      }}
      aria-label="AI 리뷰 요약 다시 생성"
    >
      <FiRefreshCw size={14} aria-hidden />
      <span>{isPending ? "요약 생성 중..." : "요약 다시 생성"}</span>
    </button>
  );
};
