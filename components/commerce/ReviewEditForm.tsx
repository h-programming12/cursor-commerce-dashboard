"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { RatingStars } from "./RatingStars/RatingStars";
import { updateReview } from "@/app/(commerce)/products/[productId]/review-actions";

const MIN_CONTENT_LENGTH = 10;

export interface ReviewEditFormProps {
  reviewId: string;
  productId: string;
  initialRating: number;
  initialContent: string;
  userName: string;
  userAvatar?: string;
  onCancel: () => void;
  onSuccess?: () => void;
  className?: string;
}

export const ReviewEditForm: React.FC<ReviewEditFormProps> = ({
  reviewId,
  productId,
  initialRating,
  initialContent,
  userName,
  userAvatar,
  onCancel,
  onSuccess,
  className,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
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

    startTransition(async () => {
      const result = await updateReview(reviewId, productId, rating, content);
      if (result.success) {
        toast.success("리뷰가 수정되었습니다.");
        onSuccess?.();
      } else {
        setError(result.error ?? "리뷰 수정에 실패했습니다.");
      }
    });
  };

  const canSubmit =
    rating >= 1 &&
    content.trim().length >= MIN_CONTENT_LENGTH &&
    !isPending &&
    (rating !== initialRating || content.trim() !== initialContent.trim());

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-2", className)}
      aria-label="리뷰 수정"
    >
      <div
        className={cn(
          "flex flex-col gap-4 rounded-2xl border-2 p-4",
          error && "border-(--commerce-semantic-error)"
        )}
        style={{
          backgroundColor: "var(--commerce-background-paper)",
          borderColor: error
            ? "var(--commerce-semantic-error)"
            : "var(--commerce-neutral-03-75)",
        }}
      >
        {/* 프로필 정보 */}
        <div className="flex items-center gap-4">
          {userAvatar ? (
            <div
              className="relative shrink-0 overflow-hidden"
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "48px",
              }}
            >
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
                sizes="72px"
              />
            </div>
          ) : (
            <div
              className="flex shrink-0 items-center justify-center"
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "48px",
                backgroundColor: commerceColors.background.light,
              }}
            >
              <span
                style={{
                  fontSize: `${commerceTypography.headline.h7.fontSize}px`,
                  fontFamily: commerceTypography.headline.h7.fontFamily,
                  fontWeight: commerceTypography.headline.h7.fontWeight,
                  color: commerceColors.text.tertiary,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h4
            style={{
              fontSize: `${commerceTypography.body["1-semi"].fontSize}px`,
              lineHeight: `${commerceTypography.body["1-semi"].lineHeight}`,
              fontFamily: commerceTypography.body["1-semi"].fontFamily,
              fontWeight: commerceTypography.body["1-semi"].fontWeight,
              color: commerceColors.text.primary,
            }}
          >
            {userName}
          </h4>
        </div>

        {/* 수정 중 강조: 별점 + 입력란 (border) */}
        <div
          className="flex items-center gap-4 rounded-xl border-2 px-4 py-3"
          style={{
            borderColor: "var(--commerce-neutral-03-75)",
            backgroundColor: commerceColors.background.default,
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
            placeholder="리뷰 내용"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--commerce-text-tertiary) focus:outline-none focus:ring-0"
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
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-[80px] border-2 px-4 py-2 font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 disabled:opacity-50"
            style={{
              borderColor: commerceColors.neutral["07"]["100"],
              fontSize: commerceTypography.button.m.fontSize,
              fontFamily: commerceTypography.button.m.fontFamily,
              fontWeight: commerceTypography.button.m.fontWeight,
              lineHeight: "28px",
              letterSpacing: "-0.4px",
              color: commerceColors.neutral["07"]["100"],
            }}
            aria-label="취소"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "rounded-[80px] px-4 py-2 font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 disabled:opacity-50"
            )}
            style={{
              backgroundColor: "var(--commerce-neutral-07-100)",
              fontSize: commerceTypography.button.m.fontSize,
              fontFamily: commerceTypography.button.m.fontFamily,
              fontWeight: commerceTypography.button.m.fontWeight,
              lineHeight: "28px",
              letterSpacing: "-0.4px",
              color: commerceColors.text.inverse,
            }}
            aria-label="저장"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
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
