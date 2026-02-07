"use client";

import React, { useState, useTransition } from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { RatingStars } from "../RatingStars/RatingStars";

const MIN_CONTENT_LENGTH = 10;

export type ReviewFormAction = (
  formData: FormData
) => Promise<{ success: boolean; error?: string }>;

export interface ReviewFormProps {
  productId: string;
  action: ReviewFormAction;
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId: _productId,
  action,
  className,
}) => {
  void _productId;
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("평점을 선택해 주세요.");
      return;
    }
    if (content.trim().length < MIN_CONTENT_LENGTH) {
      setError(`리뷰 내용은 최소 ${MIN_CONTENT_LENGTH}자 이상 입력해 주세요.`);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("rating", String(rating));
    formData.set("content", content);

    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        setContent("");
        setRating(0);
      } else {
        setError(result.error ?? "리뷰 작성에 실패했습니다.");
      }
    });
  };

  const canSubmit =
    rating >= 1 && content.trim().length >= MIN_CONTENT_LENGTH && !isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-2", className)}
      aria-label="리뷰 작성"
    >
      <div
        className={cn(
          "flex items-center gap-4 rounded-2xl border px-6",
          error && "border-(--commerce-semantic-error)"
        )}
        style={{
          height: 72,
          backgroundColor: "var(--commerce-background-paper)",
          borderColor: error
            ? "var(--commerce-semantic-error)"
            : "var(--commerce-neutral-03-100)",
        }}
      >
        <RatingStars
          rating={rating}
          size="small"
          interactive
          onRatingChange={setRating}
          showRating={false}
          className="shrink-0"
        />
        <input
          type="text"
          placeholder="Share your thoughts"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--commerce-text-tertiary) focus:outline-none"
          style={{
            fontSize: commerceTypography.body["2"].fontSize,
            lineHeight: "26px",
            fontFamily: commerceTypography.body["2"].fontFamily,
            fontWeight: commerceTypography.body["2"].fontWeight,
            color: commerceColors.text.primary,
          }}
          aria-label="리뷰 내용"
          aria-invalid={!!error}
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "shrink-0 rounded-[80px] px-6 font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 disabled:opacity-50"
          )}
          style={{
            height: 40,
            backgroundColor: "var(--commerce-neutral-07-100)",
            fontSize: commerceTypography.button.m.fontSize,
            fontFamily: commerceTypography.button.m.fontFamily,
            fontWeight: commerceTypography.button.m.fontWeight,
            lineHeight: "28px",
            letterSpacing: "-0.4px",
            color: commerceColors.text.inverse,
          }}
          aria-label="리뷰 작성 제출"
        >
          {isPending ? "작성 중..." : "Write Review"}
        </button>
      </div>
      {/* 최소 10자 실시간 피드백 */}
      {content.length > 0 && content.length < MIN_CONTENT_LENGTH && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm"
          style={{
            color: "var(--commerce-text-tertiary)",
            fontFamily: commerceTypography.caption["1"].fontFamily,
            fontSize: commerceTypography.caption["1"].fontSize,
            lineHeight: "20px",
          }}
        >
          {content.length}/{MIN_CONTENT_LENGTH}자 (최소 10자 이상 입력해 주세요)
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="text-sm"
          style={{
            color: "var(--commerce-semantic-error)",
            fontFamily: commerceTypography.body["2"].fontFamily,
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
};
