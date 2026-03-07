"use client";

import React from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { commerceTypography } from "@/commons/constants/typography";

export type StepStatus = "pending" | "processing" | "completed" | "failed";

export interface ReviewSummaryStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
}

export interface ReviewSummaryStepIndicatorProps {
  steps: ReviewSummaryStep[];
  className?: string;
}

export const ReviewSummaryStepIndicator: React.FC<
  ReviewSummaryStepIndicatorProps
> = ({ steps, className }) => {
  return (
    <div
      className={className}
      role="status"
      aria-label="AI 리뷰 요약 생성 단계"
    >
      <ul className="flex flex-col gap-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const lineCompleted =
            step.status === "completed" || step.status === "failed";
          return (
            <li
              key={step.id}
              className="flex gap-3"
              aria-current={step.status === "processing" ? "step" : undefined}
            >
              <div className="flex flex-col items-center">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium transition-colors"
                  style={
                    step.status === "pending"
                      ? {
                          borderColor: "var(--commerce-neutral-03-100)",
                          color: "var(--commerce-text-tertiary)",
                          fontFamily:
                            commerceTypography.caption["1-semi"].fontFamily,
                          fontWeight:
                            commerceTypography.caption["1-semi"].fontWeight,
                          fontSize: 10,
                          lineHeight: 1.2,
                        }
                      : step.status === "processing"
                      ? {
                          borderColor: "var(--commerce-neutral-03-100)",
                          color: "var(--commerce-primary-main)",
                        }
                      : step.status === "completed"
                      ? {
                          borderColor: "var(--commerce-neutral-03-100)",
                          backgroundColor:
                            "color-mix(in srgb, var(--commerce-semantic-success) 22%, var(--commerce-neutral-02-100))",
                          color: "var(--commerce-semantic-success)",
                        }
                      : {
                          borderColor: "var(--commerce-neutral-03-100)",
                          backgroundColor:
                            "color-mix(in srgb, var(--commerce-semantic-error) 22%, var(--commerce-neutral-02-100))",
                          color: "var(--commerce-semantic-error)",
                        }
                  }
                  aria-hidden
                >
                  {step.status === "processing" && (
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-current border-t-transparent animate-spin"
                      aria-hidden
                    />
                  )}
                  {step.status === "completed" && (
                    <FiCheck size={10} strokeWidth={2.5} aria-hidden />
                  )}
                  {step.status === "failed" && (
                    <FiX size={10} strokeWidth={2.5} aria-hidden />
                  )}
                  {step.status === "pending" && (
                    <span aria-hidden>{index + 1}</span>
                  )}
                </span>
                {!isLast && (
                  <div
                    className="w-px flex-1 min-h-[16px]"
                    style={{
                      backgroundColor: lineCompleted
                        ? "var(--commerce-primary-main)"
                        : "var(--commerce-neutral-03-100)",
                    }}
                    aria-hidden
                  />
                )}
              </div>
              <div className="pb-5 pt-0.5">
                <p
                  className="font-medium"
                  style={{
                    fontFamily: commerceTypography.caption["1-semi"].fontFamily,
                    fontWeight: commerceTypography.caption["1-semi"].fontWeight,
                    fontSize: commerceTypography.caption["1"].fontSize,
                    lineHeight: commerceTypography.caption["1"].lineHeight,
                    color:
                      step.status === "pending"
                        ? "var(--commerce-text-tertiary)"
                        : "var(--commerce-text-primary)",
                  }}
                >
                  {step.label}
                </p>
                <p
                  className="mt-0.5"
                  style={{
                    fontFamily: commerceTypography.caption["2"].fontFamily,
                    fontWeight: commerceTypography.caption["2"].fontWeight,
                    fontSize: commerceTypography.caption["2"].fontSize,
                    lineHeight: commerceTypography.caption["2"].lineHeight,
                    color: "var(--commerce-text-tertiary)",
                  }}
                >
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
