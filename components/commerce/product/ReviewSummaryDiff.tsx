"use client";

import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import { diffText } from "@/lib/ai/diff";

export interface ReviewSummaryDiffProps {
  previousSummary: ReviewSummaryResult;
  currentSummary: ReviewSummaryResult;
  onApprove: () => void;
  onReject: () => void;
  className?: string;
}

export const ReviewSummaryDiff: React.FC<ReviewSummaryDiffProps> = ({
  previousSummary,
  currentSummary,
  onApprove,
  onReject,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const segments = diffText(previousSummary.summary, currentSummary.summary);

  return (
    <div
      className={className}
      style={{
        border: `1px solid ${commerceColors.neutral["03"]["100"]}`,
        borderRadius: 8,
        padding: 12,
        backgroundColor: commerceColors.background.default,
      }}
      role="region"
      aria-label="요약 변경사항"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) rounded py-1"
        style={{
          fontFamily: commerceTypography.caption["1-semi"].fontFamily,
          fontWeight: commerceTypography.caption["1-semi"].fontWeight,
          fontSize: commerceTypography.caption["1-semi"].fontSize,
          lineHeight: commerceTypography.caption["1-semi"].lineHeight,
          color: commerceColors.text.primary,
        }}
        aria-expanded={isOpen}
      >
        변경사항
        {isOpen ? (
          <FiChevronUp size={16} aria-hidden />
        ) : (
          <FiChevronDown size={16} aria-hidden />
        )}
      </button>
      {isOpen && (
        <>
          <div
            className="mt-3 p-3 rounded overflow-x-auto"
            style={{
              backgroundColor: commerceColors.background.light,
              fontSize: commerceTypography.caption["1"].fontSize,
              lineHeight: 1.5,
              fontFamily: commerceTypography.caption["1"].fontFamily,
              fontWeight: commerceTypography.caption["1"].fontWeight,
              color: commerceColors.text.primary,
            }}
          >
            {segments.map((seg, idx) => {
              if (seg.type === "unchanged") {
                return <span key={idx}>{seg.text} </span>;
              }
              if (seg.type === "added") {
                return (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: "rgba(56, 203, 137, 0.22)",
                      color: commerceColors.neutral["07"]["100"],
                      padding: "0 2px",
                      borderRadius: 2,
                    }}
                  >
                    {seg.text}{" "}
                  </span>
                );
              }
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "rgba(255, 86, 48, 0.12)",
                    color: commerceColors.text.tertiary,
                    textDecoration: "line-through",
                    padding: "0 2px",
                    borderRadius: 2,
                  }}
                >
                  {seg.text}{" "}
                </span>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onApprove}
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                borderRadius: 8,
                border: "none",
                backgroundColor: commerceColors.neutral["07"]["100"],
                color: commerceColors.text.inverse,
                fontSize: commerceTypography.caption["1-semi"].fontSize,
                lineHeight: commerceTypography.caption["1-semi"].lineHeight,
                fontFamily: commerceTypography.caption["1-semi"].fontFamily,
                fontWeight: commerceTypography.caption["1-semi"].fontWeight,
                cursor: "pointer",
              }}
            >
              승인
            </button>
            <button
              type="button"
              onClick={onReject}
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                borderRadius: 8,
                border: `1px solid ${commerceColors.neutral["03"]["100"]}`,
                backgroundColor: "transparent",
                color: commerceColors.text.secondary,
                fontSize: commerceTypography.caption["1-semi"].fontSize,
                lineHeight: commerceTypography.caption["1-semi"].lineHeight,
                fontFamily: commerceTypography.caption["1-semi"].fontFamily,
                fontWeight: commerceTypography.caption["1-semi"].fontWeight,
                cursor: "pointer",
              }}
            >
              거부
            </button>
          </div>
        </>
      )}
    </div>
  );
};
