"use client";

import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import {
  calculateConfidence,
  getConfidenceLevel,
  type ConfidenceLevel,
} from "@/lib/ai/confidence";

export interface ReviewSummaryConfidenceProps {
  reviewCount: number;
  ratingVariance: number;
  averageReviewLength: number;
  summaryStability: number;
  className?: string;
}

const levelColors: Record<
  ConfidenceLevel,
  { bg: string; bar: string; label: string }
> = {
  high: {
    bg: "var(--commerce-semantic-success)",
    bar: "var(--commerce-semantic-success)",
    label: "높음",
  },
  medium: {
    bg: "var(--commerce-semantic-warning)",
    bar: "var(--commerce-semantic-warning)",
    label: "보통",
  },
  low: {
    bg: "var(--commerce-semantic-error)",
    bar: "var(--commerce-semantic-error)",
    label: "낮음",
  },
};

export const ReviewSummaryConfidence: React.FC<
  ReviewSummaryConfidenceProps
> = ({
  reviewCount,
  ratingVariance,
  averageReviewLength,
  summaryStability,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const confidence = calculateConfidence({
    reviewCount,
    ratingVariance,
    averageReviewLength,
    summaryStability,
  });
  const level = getConfidenceLevel(confidence);
  const colors = levelColors[level];
  const percent = Math.round(confidence * 100);

  return (
    <div
      className={className}
      style={{
        border: `1px solid ${commerceColors.neutral["03"]["100"]}`,
        borderRadius: 8,
        padding: 12,
        backgroundColor: commerceColors.background.default,
      }}
      role="group"
      aria-label="리뷰 신뢰도"
    >
      <p
        className="mb-2"
        style={{
          fontSize: commerceTypography.caption["1-semi"].fontSize,
          lineHeight: commerceTypography.caption["1-semi"].lineHeight,
          fontFamily: commerceTypography.caption["1-semi"].fontFamily,
          fontWeight: commerceTypography.caption["1-semi"].fontWeight,
          color: commerceColors.text.primary,
        }}
      >
        리뷰 신뢰도
      </p>
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: commerceColors.neutral["02"]["100"] }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${percent}%`,
              backgroundColor: colors.bar,
            }}
          />
        </div>
        <span
          style={{
            fontSize: commerceTypography.caption["1-semi"].fontSize,
            lineHeight: commerceTypography.caption["1-semi"].lineHeight,
            fontFamily: commerceTypography.caption["1-semi"].fontFamily,
            fontWeight: commerceTypography.caption["1-semi"].fontWeight,
            color: commerceColors.text.primary,
            minWidth: 48,
          }}
        >
          {percent}%
        </span>
        <span
          style={{
            fontSize: commerceTypography.caption["2"].fontSize,
            lineHeight: commerceTypography.caption["2"].lineHeight,
            fontFamily: commerceTypography.caption["2"].fontFamily,
            fontWeight: commerceTypography.caption["2"].fontWeight,
            color: colors.bg,
            minWidth: 32,
          }}
        >
          {colors.label}
        </span>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="shrink-0 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100)"
          style={{ color: commerceColors.text.secondary }}
          aria-expanded={showDetails}
          aria-label={showDetails ? "상세 접기" : "상세 펼치기"}
        >
          {showDetails ? (
            <FiChevronUp size={16} aria-hidden />
          ) : (
            <FiChevronDown size={16} aria-hidden />
          )}
        </button>
      </div>
      {showDetails && (
        <ul
          className="mt-3 pt-3 space-y-1 border-t border-(--commerce-neutral-03-100)"
          style={{
            fontSize: commerceTypography.caption["2"].fontSize,
            lineHeight: commerceTypography.caption["2"].lineHeight,
            fontFamily: commerceTypography.caption["2"].fontFamily,
            fontWeight: commerceTypography.caption["2"].fontWeight,
            color: commerceColors.text.secondary,
          }}
        >
          <li>리뷰 개수: {Math.round(reviewCount * 100)}%</li>
          <li>별점 일관성: {Math.round(ratingVariance * 100)}%</li>
          <li>평균 리뷰 길이: {Math.round(averageReviewLength * 100)}%</li>
          <li>요약 안정성: {Math.round(summaryStability * 100)}%</li>
        </ul>
      )}
    </div>
  );
};
