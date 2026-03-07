"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiRefreshCw, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import {
  generateAiReviewSummary,
  type GenerateSummaryResult,
} from "@/app/(commerce)/products/[productId]/review-summary-actions";

const MAX_RETRIES = 3;

export interface RetryState {
  retryCount: number;
  lastError: string | null;
  retryHistory: string[];
}

export interface RetryReviewSummaryButtonProps {
  productId: string;
  isAdmin?: boolean;
  /** 성공 시 새 요약 전달. 없으면 router.refresh()만 수행 */
  onRegenerated?: (newSummary?: ReviewSummaryResult) => void;
  onPendingChange?: (pending: boolean) => void;
  className?: string;
}

export const RetryReviewSummaryButton: React.FC<
  RetryReviewSummaryButtonProps
> = ({ productId, isAdmin, onRegenerated, onPendingChange, className }) => {
  const [isPending, startTransition] = useTransition();
  const [showHistory, setShowHistory] = useState(false);
  const [retryState, setRetryState] = useState<RetryState>({
    retryCount: 0,
    lastError: null,
    retryHistory: [],
  });
  const router = useRouter();

  if (!isAdmin) {
    return null;
  }

  const remaining = MAX_RETRIES - retryState.retryCount;
  const isExhausted = remaining <= 0;

  const handleClick = () => {
    if (isPending || isExhausted) return;

    onPendingChange?.(true);
    startTransition(async () => {
      try {
        const result: GenerateSummaryResult = await generateAiReviewSummary(
          productId
        );

        if (result.success) {
          setRetryState((prev) => ({
            ...prev,
            lastError: null,
            retryHistory: prev.retryHistory,
          }));
          toast.success("AI 리뷰 요약이 생성되었습니다.");
          if (onRegenerated) onRegenerated(result.summary);
          else router.refresh();
        } else {
          const errorMessage =
            result.error || "AI 리뷰 요약 생성 중 오류가 발생했습니다.";
          setRetryState((prev) => ({
            retryCount: prev.retryCount + 1,
            lastError: errorMessage,
            retryHistory: [...prev.retryHistory, errorMessage],
          }));
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
              toast.error(errorMessage);
          }
        }
      } catch {
        const errorMessage = "AI 리뷰 요약 생성 중 오류가 발생했습니다.";
        setRetryState((prev) => ({
          retryCount: prev.retryCount + 1,
          lastError: errorMessage,
          retryHistory: [...prev.retryHistory, errorMessage],
        }));
        toast.error(errorMessage);
      } finally {
        onPendingChange?.(false);
      }
    });
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending || isExhausted}
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
            cursor: isPending || isExhausted ? "default" : "pointer",
            opacity: isPending || isExhausted ? 0.7 : 1,
          }}
          aria-label="AI 리뷰 요약 다시 생성"
        >
          <FiRefreshCw size={14} aria-hidden />
          <span>
            {isPending
              ? "재생성 중..."
              : isExhausted
              ? "재시도 횟수 초과"
              : `리뷰 요약 재생성 (${remaining}회 남음)`}
          </span>
        </button>
        {retryState.lastError && (
          <span
            style={{
              fontSize: commerceTypography.caption["2"].fontSize,
              lineHeight: commerceTypography.caption["2"].lineHeight,
              fontFamily: commerceTypography.caption["2"].fontFamily,
              fontWeight: commerceTypography.caption["2"].fontWeight,
              color: commerceColors.semantic.error,
            }}
          >
            {retryState.lastError}
          </span>
        )}
      </div>
      {retryState.retryHistory.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) rounded"
            style={{
              fontSize: commerceTypography.caption["2"].fontSize,
              lineHeight: commerceTypography.caption["2"].lineHeight,
              fontFamily: commerceTypography.caption["2"].fontFamily,
              fontWeight: commerceTypography.caption["2"].fontWeight,
              color: commerceColors.text.tertiary,
            }}
            aria-expanded={showHistory}
          >
            {showHistory ? (
              <FiChevronUp size={14} aria-hidden />
            ) : (
              <FiChevronDown size={14} aria-hidden />
            )}
            재시도 히스토리
          </button>
          {showHistory && (
            <ul
              className="mt-1 pl-4 list-disc space-y-0.5"
              style={{
                fontSize: commerceTypography.caption["2"].fontSize,
                lineHeight: commerceTypography.caption["2"].lineHeight,
                fontFamily: commerceTypography.caption["2"].fontFamily,
                fontWeight: commerceTypography.caption["2"].fontWeight,
                color: commerceColors.text.tertiary,
              }}
            >
              {retryState.retryHistory.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
