"use client";

import React from "react";
import { BsRobot } from "react-icons/bs";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

const AI_REVIEW_MOCK =
  "이 제품은 음질과 착용감에서 높은 평가를 받고 있습니다. 대부분의 고객들이 가격 대비 성능이 우수하다고 평가하며, 특히 노이즈 캔슬링 기능과 블루투스 연결성을 칭찬하고 있습니다. 일부 사용자는 배터리 수명이 아쉽다고 언급했지만, 전반적으로 만족도가 매우 높은 제품입니다.";

export interface ReviewSummaryDisplayProps {
  summary?: string;
  className?: string;
}

export const ReviewSummaryDisplay: React.FC<ReviewSummaryDisplayProps> = ({
  summary = AI_REVIEW_MOCK,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "rgba(232, 236, 239, 0.5)",
        borderRadius: 8,
        padding: 24,
      }}
      role="region"
      aria-label="AI 리뷰 요약"
    >
      <div className="flex gap-4">
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 9999,
            backgroundColor: commerceColors.neutral["04"]["100"],
            color: commerceColors.text.inverse,
          }}
          aria-hidden
        >
          <BsRobot size={24} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className="mb-2"
            style={{
              fontFamily: commerceTypography.body["2-semi"].fontFamily,
              fontWeight: commerceTypography.body["2-semi"].fontWeight,
              fontSize: 16,
              lineHeight: "26px",
              color: "#111827",
            }}
          >
            AI Review
          </h4>
          <p
            style={{
              fontFamily: commerceTypography.caption["1"].fontFamily,
              fontWeight: commerceTypography.caption["1"].fontWeight,
              fontSize: 14,
              lineHeight: "24px",
              color: commerceColors.neutral["07"]["100"],
            }}
          >
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
};
