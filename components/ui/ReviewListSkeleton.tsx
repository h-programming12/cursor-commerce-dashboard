import React from "react";
import { cn } from "@/commons/utils/cn";

export interface ReviewListSkeletonProps {
  count?: number;
  className?: string;
}

function ReviewCardSkeletonItem() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-(--commerce-neutral-03-100) p-6"
      style={{ backgroundColor: "var(--commerce-background-paper)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div
            className="shrink-0 rounded-full bg-(--commerce-neutral-03-100)"
            style={{ width: 48, height: 48 }}
          />
          <div className="space-y-2">
            <div className="h-5 w-24 rounded bg-(--commerce-neutral-03-100)" />
            <div className="h-4 w-20 rounded bg-(--commerce-neutral-03-100)" />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-(--commerce-neutral-03-100)" />
        <div className="h-4 w-full rounded bg-(--commerce-neutral-03-100)" />
        <div className="h-4 w-3/4 rounded bg-(--commerce-neutral-03-100)" />
      </div>
    </div>
  );
}

export const ReviewListSkeleton: React.FC<ReviewListSkeletonProps> = ({
  count = 3,
  className,
}) => (
  <div
    className={cn("space-y-4", className)}
    role="status"
    aria-label="리뷰 목록 로딩 중"
  >
    <div className="h-8 w-32 rounded bg-(--commerce-neutral-03-100) animate-pulse mb-6" />
    <ul className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ReviewCardSkeletonItem />
        </li>
      ))}
    </ul>
  </div>
);
