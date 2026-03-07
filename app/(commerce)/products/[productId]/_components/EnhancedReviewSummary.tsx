"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ReviewSummaryDisplay } from "./ReviewSummaryDisplay";
import { ReviewSummaryConfidence } from "@/components/commerce/product/ReviewSummaryConfidence";
import { RetryReviewSummaryButton } from "@/components/commerce/product/RetryReviewSummaryButton";
import { ReviewSummaryDiff } from "@/components/commerce/product/ReviewSummaryDiff";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import type { ReviewStats } from "../review-summary-actions";
import { updateReviewSummary } from "../review-summary-actions";

export interface EnhancedReviewSummaryProps {
  productId: string;
  isAdmin?: boolean;
  initialSummary?: ReviewSummaryResult | null;
  reviewStats: ReviewStats;
}

export function EnhancedReviewSummary({
  productId,
  isAdmin,
  initialSummary,
  reviewStats,
}: EnhancedReviewSummaryProps) {
  const router = useRouter();
  const [displaySummary, setDisplaySummary] =
    useState<ReviewSummaryResult | null>(initialSummary ?? null);
  const [previousSummary, setPreviousSummary] =
    useState<ReviewSummaryResult | null>(null);
  const displaySummaryRef = useRef<ReviewSummaryResult | null>(displaySummary);
  useEffect(() => {
    displaySummaryRef.current = displaySummary;
  }, [displaySummary]);

  const handleRegenerated = useCallback((newSummary?: ReviewSummaryResult) => {
    if (newSummary == null) return;
    setPreviousSummary(displaySummaryRef.current);
    setDisplaySummary(newSummary);
  }, []);

  const handleApprove = useCallback(() => {
    setPreviousSummary(null);
  }, []);

  const handleReject = useCallback(async () => {
    if (!previousSummary) return;
    const result = await updateReviewSummary(productId, previousSummary);
    if (result.success) {
      setDisplaySummary(previousSummary);
      setPreviousSummary(null);
      toast.success("이전 요약으로 되돌렸습니다.");
      router.refresh();
    } else {
      toast.error(result.error ?? "되돌리기에 실패했습니다.");
    }
  }, [productId, previousSummary, router]);

  const action = (
    <RetryReviewSummaryButton
      productId={productId}
      isAdmin={isAdmin}
      onRegenerated={handleRegenerated}
    />
  );

  return (
    <div className="mb-6 space-y-3">
      <ReviewSummaryConfidence
        reviewCount={reviewStats.reviewCount}
        ratingVariance={reviewStats.ratingVariance}
        averageReviewLength={reviewStats.averageReviewLength}
        summaryStability={reviewStats.summaryStability}
      />
      <ReviewSummaryDisplay
        productId={productId}
        initialSummary={displaySummary ?? undefined}
        action={action}
        className="mb-0!"
      />
      {previousSummary && displaySummary && (
        <ReviewSummaryDiff
          previousSummary={previousSummary}
          currentSummary={displaySummary}
          onApprove={handleApprove}
          onReject={handleReject}
          className="mt-6"
        />
      )}
    </div>
  );
}
