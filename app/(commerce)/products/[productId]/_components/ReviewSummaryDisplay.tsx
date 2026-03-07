"use client";

import React, {
  useEffect,
  useState,
  cloneElement,
  isValidElement,
} from "react";
import { BsRobot } from "react-icons/bs";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import { getReviewSummary } from "../review-summary-actions";

export interface ReviewSummaryDisplayProps {
  productId: string;
  className?: string;
  refreshKey?: number;
  action?: React.ReactNode;
  /** 서버에서 미리 로드한 요약(있으면 클라이언트 fetch 생략) */
  initialSummary?: ReviewSummaryResult | null;
}

export const ReviewSummaryDisplay: React.FC<ReviewSummaryDisplayProps> = ({
  productId,
  className,
  refreshKey,
  action,
  initialSummary,
}) => {
  const [summary, setSummary] = useState<ReviewSummaryResult | null>(
    initialSummary ?? null
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    initialSummary === undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const actionWithPending =
    action && isValidElement(action)
      ? cloneElement(
          action as React.ReactElement<{
            onPendingChange?: (pending: boolean) => void;
          }>,
          {
            onPendingChange: setIsRegenerating,
          }
        )
      : action;

  useEffect(() => {
    if (initialSummary !== undefined) {
      setSummary(initialSummary ?? null);
      setIsLoading(false);
      return;
    }
    let isMounted = true;

    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getReviewSummary(productId);
        if (!isMounted) return;
        setSummary(result);
      } catch (fetchError) {
        if (!isMounted) return;
        // eslint-disable-next-line no-console
        console.error("[ReviewSummaryDisplay] 요약 조회 실패:", fetchError);
        setError("AI 리뷰 요약을 불러오지 못했습니다.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    void fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [productId, refreshKey, initialSummary]);

  const hasSummary = !!summary;

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
          <div className="mb-2 flex items-center justify-between gap-2">
            <h4
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
            {actionWithPending}
          </div>

          {isRegenerating ? (
            <div
              className="space-y-3 animate-pulse"
              role="status"
              aria-label="요약 재생성 중"
            >
              <div className="space-y-2">
                <div className="h-5 w-full rounded bg-(--commerce-neutral-03-100)" />
                <div className="h-5 w-full rounded bg-(--commerce-neutral-03-100)" />
                <div className="h-5 w-4/5 rounded bg-(--commerce-neutral-03-100)" />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="h-5 w-16 rounded-full bg-(--commerce-neutral-03-100)" />
                <div className="h-5 w-20 rounded-full bg-(--commerce-neutral-03-100)" />
                <div className="h-5 w-14 rounded-full bg-(--commerce-neutral-03-100)" />
              </div>
            </div>
          ) : isLoading ? (
            <p
              style={{
                fontFamily: commerceTypography.caption["1"].fontFamily,
                fontWeight: commerceTypography.caption["1"].fontWeight,
                fontSize: 14,
                lineHeight: "24px",
                color: commerceColors.neutral["07"]["100"],
              }}
            >
              AI 리뷰 요약을 불러오는 중입니다...
            </p>
          ) : error ? (
            <p
              style={{
                fontFamily: commerceTypography.caption["1"].fontFamily,
                fontWeight: commerceTypography.caption["1"].fontWeight,
                fontSize: 14,
                lineHeight: "24px",
                color: commerceColors.semantic.error,
              }}
            >
              {error}
            </p>
          ) : !hasSummary ? (
            <p
              style={{
                fontFamily: commerceTypography.caption["1"].fontFamily,
                fontWeight: commerceTypography.caption["1"].fontWeight,
                fontSize: 14,
                lineHeight: "24px",
                color: commerceColors.neutral["07"]["100"],
              }}
            >
              아직 AI 리뷰 요약이 생성되지 않았습니다. 리뷰가 등록되면 자동으로
              생성됩니다.
            </p>
          ) : (
            <>
              <p
                className="mb-4"
                style={{
                  fontFamily: commerceTypography.caption["1"].fontFamily,
                  fontWeight: commerceTypography.caption["1"].fontWeight,
                  fontSize: 14,
                  lineHeight: "24px",
                  color: commerceColors.neutral["07"]["100"],
                }}
              >
                {summary.summary}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h5
                    className="mb-1"
                    style={{
                      fontFamily:
                        commerceTypography.caption["1-semi"].fontFamily,
                      fontWeight:
                        commerceTypography.caption["1-semi"].fontWeight,
                      fontSize: 13,
                      lineHeight: "22px",
                      color: commerceColors.text.primary,
                    }}
                  >
                    긍정적인 포인트
                  </h5>
                  {summary.positive_points.length === 0 ? (
                    <p
                      style={{
                        fontFamily: commerceTypography.caption["1"].fontFamily,
                        fontWeight: commerceTypography.caption["1"].fontWeight,
                        fontSize: 13,
                        lineHeight: "22px",
                        color: commerceColors.text.tertiary,
                      }}
                    >
                      아직 요약된 긍정 포인트가 없습니다.
                    </p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-4">
                      {summary.positive_points.map((point) => (
                        <li
                          key={point}
                          style={{
                            fontFamily:
                              commerceTypography.caption["1"].fontFamily,
                            fontWeight:
                              commerceTypography.caption["1"].fontWeight,
                            fontSize: 13,
                            lineHeight: "22px",
                            color: commerceColors.neutral["07"]["100"],
                          }}
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h5
                    className="mb-1"
                    style={{
                      fontFamily:
                        commerceTypography.caption["1-semi"].fontFamily,
                      fontWeight:
                        commerceTypography.caption["1-semi"].fontWeight,
                      fontSize: 13,
                      lineHeight: "22px",
                      color: commerceColors.text.primary,
                    }}
                  >
                    아쉬운 포인트
                  </h5>
                  {summary.negative_points.length === 0 ? (
                    <p
                      style={{
                        fontFamily: commerceTypography.caption["1"].fontFamily,
                        fontWeight: commerceTypography.caption["1"].fontWeight,
                        fontSize: 13,
                        lineHeight: "22px",
                        color: commerceColors.text.tertiary,
                      }}
                    >
                      아직 요약된 아쉬운 포인트가 없습니다.
                    </p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-4">
                      {summary.negative_points.map((point) => (
                        <li
                          key={point}
                          style={{
                            fontFamily:
                              commerceTypography.caption["1"].fontFamily,
                            fontWeight:
                              commerceTypography.caption["1"].fontWeight,
                            fontSize: 13,
                            lineHeight: "22px",
                            color: commerceColors.neutral["07"]["100"],
                          }}
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {summary.keywords.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {summary.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs"
                      style={{
                        fontFamily: commerceTypography.caption["2"].fontFamily,
                        fontWeight: commerceTypography.caption["2"].fontWeight,
                        fontSize: 12,
                        lineHeight: "20px",
                        backgroundColor: commerceColors.neutral["02"]["100"],
                        color: commerceColors.text.secondary,
                      }}
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
