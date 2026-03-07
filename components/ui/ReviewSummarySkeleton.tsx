import React from "react";
import { cn } from "@/commons/utils/cn";

export interface ReviewSummarySkeletonProps {
  className?: string;
}

export const ReviewSummarySkeleton: React.FC<ReviewSummarySkeletonProps> = ({
  className,
}) => (
  <div
    className={cn("animate-pulse", className)}
    style={{
      backgroundColor: "rgba(232, 236, 239, 0.5)",
      borderRadius: 8,
      padding: 24,
    }}
    role="status"
    aria-label="리뷰 요약 로딩 중"
  >
    <div className="flex gap-4">
      <div
        className="shrink-0 rounded-full bg-(--commerce-neutral-04-100)"
        style={{ width: 48, height: 48 }}
      />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="h-6 w-24 rounded bg-(--commerce-neutral-03-100)" />
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
    </div>
  </div>
);
