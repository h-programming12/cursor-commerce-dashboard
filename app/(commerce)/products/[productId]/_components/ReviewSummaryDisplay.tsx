"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  cloneElement,
  isValidElement,
} from "react";
import { BsRobot } from "react-icons/bs";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import {
  getReviewSummary,
  generateAiReviewSummary,
} from "../review-summary-actions";
import {
  ReviewSummaryStepIndicator,
  type ReviewSummaryStep,
} from "@/components/commerce/product/ReviewSummaryStepIndicator";

const INITIAL_STEPS: ReviewSummaryStep[] = [
  {
    id: "prepare",
    label: "준비",
    description: "요약 생성을 준비합니다.",
    status: "pending",
  },
  {
    id: "analyze",
    label: "분석",
    description: "리뷰를 분석합니다.",
    status: "pending",
  },
  {
    id: "generate",
    label: "생성",
    description: "AI가 요약을 생성합니다.",
    status: "pending",
  },
  {
    id: "complete",
    label: "완료",
    description: "저장을 완료합니다.",
    status: "pending",
  },
];

function withStepStatus(
  steps: ReviewSummaryStep[],
  id: string,
  status: ReviewSummaryStep["status"]
): ReviewSummaryStep[] {
  return steps.map((s) => (s.id === id ? { ...s, status } : s));
}

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
  const [steps, setSteps] = useState<ReviewSummaryStep[]>(() =>
    INITIAL_STEPS.map((s) => ({ ...s }))
  );
  const [isFirstTimeGenerating, setIsFirstTimeGenerating] = useState(false);
  const [showCompletionDelay, setShowCompletionDelay] = useState(false);
  const isGenerating = isRegenerating || isFirstTimeGenerating;
  const retryStepsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wasRegeneratingRef = useRef(false);

  // 완료 후 0.5초 동안 인디케이터 유지
  useEffect(() => {
    if (!showCompletionDelay) return;
    const t = setTimeout(() => setShowCompletionDelay(false), 500);
    return () => clearTimeout(t);
  }, [showCompletionDelay]);

  const handleGenerate = useCallback(() => {
    setSteps(
      withStepStatus(
        INITIAL_STEPS.map((s) => ({ ...s })),
        "prepare",
        "processing"
      )
    );
    setIsFirstTimeGenerating(true);
  }, []);

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

  // 첫 생성: prepare → analyze → generate(API) → complete
  useEffect(() => {
    if (!isFirstTimeGenerating) return;
    let mounted = true;
    const t1 = setTimeout(() => {
      if (!mounted) return;
      setSteps((prev) =>
        withStepStatus(
          withStepStatus(prev, "prepare", "completed"),
          "analyze",
          "processing"
        )
      );
    }, 500);
    const t2 = setTimeout(() => {
      if (!mounted) return;
      setSteps((prev) =>
        withStepStatus(
          withStepStatus(prev, "analyze", "completed"),
          "generate",
          "processing"
        )
      );
      void generateAiReviewSummary(productId).then((result) => {
        if (!mounted) return;
        if (result.success) {
          setSteps((prev) =>
            withStepStatus(
              withStepStatus(prev, "generate", "completed"),
              "complete",
              "completed"
            )
          );
          setSummary(result.summary);
          setShowCompletionDelay(true);
        } else {
          setSteps((prev) => withStepStatus(prev, "generate", "failed"));
        }
        setIsFirstTimeGenerating(false);
      });
    }, 500 + 1000);
    return () => {
      mounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isFirstTimeGenerating, productId]);

  // 재생성(Retry) 중: prepare → analyze → generate(processing) 표시
  useEffect(() => {
    if (!isRegenerating) return;
    wasRegeneratingRef.current = true;
    setSteps(
      withStepStatus(
        INITIAL_STEPS.map((s) => ({ ...s })),
        "prepare",
        "processing"
      )
    );
    const t1 = setTimeout(() => {
      setSteps((prev) =>
        withStepStatus(
          withStepStatus(prev, "prepare", "completed"),
          "analyze",
          "processing"
        )
      );
    }, 500);
    const t2 = setTimeout(() => {
      setSteps((prev) =>
        withStepStatus(
          withStepStatus(prev, "analyze", "completed"),
          "generate",
          "processing"
        )
      );
    }, 1500);
    retryStepsRef.current = [t1, t2];
    return () => {
      retryStepsRef.current.forEach(clearTimeout);
      retryStepsRef.current = [];
    };
  }, [isRegenerating]);

  // 재생성 완료 시 generate·complete를 completed로, 0.5초 뒤 요약 표시
  useEffect(() => {
    if (isRegenerating || !wasRegeneratingRef.current) return;
    wasRegeneratingRef.current = false;
    setSteps((prev) =>
      withStepStatus(
        withStepStatus(prev, "generate", "completed"),
        "complete",
        "completed"
      )
    );
    setShowCompletionDelay(true);
  }, [isRegenerating]);

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
          <div className="mb-2 flex md:items-center justify-between gap-2 flex-col md:flex-row">
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

          {isGenerating || showCompletionDelay ? (
            <ReviewSummaryStepIndicator steps={steps} />
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
            <div className="space-y-2">
              <p
                style={{
                  fontFamily: commerceTypography.caption["1"].fontFamily,
                  fontWeight: commerceTypography.caption["1"].fontWeight,
                  fontSize: 14,
                  lineHeight: "24px",
                  color: commerceColors.neutral["07"]["100"],
                }}
              >
                아직 AI 리뷰 요약이 생성되지 않았습니다.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-full px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-primary-main) focus-visible:ring-offset-2"
                style={{
                  backgroundColor: "var(--commerce-primary-main)",
                  color: "var(--commerce-text-inverse)",
                  fontFamily: commerceTypography.caption["1-semi"].fontFamily,
                  fontWeight: commerceTypography.caption["1-semi"].fontWeight,
                  fontSize: 14,
                  lineHeight: "24px",
                }}
                aria-label="AI 요약 생성하기"
              >
                AI 요약 생성하기
              </button>
            </div>
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
