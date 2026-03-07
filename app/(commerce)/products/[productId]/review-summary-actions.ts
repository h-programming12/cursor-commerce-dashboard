"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import type { ReviewSummaryResult } from "@/lib/ai/review-summary";
import { generateFullReviewSummary } from "@/lib/ai/review-summary";
import { checkAdminAccess } from "@/lib/auth/admin";

type ProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "review_summary"
>;

type ReviewRow = Pick<
  Database["public"]["Tables"]["reviews"]["Row"],
  "rating" | "content"
>;

export type GenerateSummaryErrorCode =
  | "AUTH_REQUIRED"
  | "NO_REVIEWS"
  | "AI_ERROR"
  | "DB_ERROR"
  | "UNKNOWN";

export type GenerateSummaryResult =
  | { success: true; summary: ReviewSummaryResult }
  | { success: false; error: string; code: GenerateSummaryErrorCode };

/**
 * 상품에 저장된 AI 리뷰 요약을 조회합니다.
 *
 * @param productId - 상품 ID
 * @returns 리뷰 요약이 있으면 ReviewSummaryResult, 없으면 null
 */
export async function getReviewSummary(
  productId: string
): Promise<ReviewSummaryResult | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, review_summary")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[getReviewSummary] 상품 조회 실패:", error);
    return null;
  }

  const row = data as ProductRow | null;
  if (!row || !row.review_summary) {
    return null;
  }

  try {
    return row.review_summary as unknown as ReviewSummaryResult;
  } catch (parseError) {
    // eslint-disable-next-line no-console
    console.error("[getReviewSummary] review_summary 파싱 실패:", parseError);
    return null;
  }
}

/**
 * 모든 리뷰를 기반으로 Gemini를 사용해 AI 리뷰 요약을 생성하고,
 * products.review_summary 컬럼에 저장합니다.
 *
 * @param productId - 상품 ID
 * @returns 생성 성공/실패 결과
 */
export async function generateAiReviewSummary(
  productId: string
): Promise<GenerateSummaryResult> {
  const isAdmin = await checkAdminAccess();

  if (!isAdmin) {
    return {
      success: false,
      error: "AI 리뷰 요약은 관리자만 생성할 수 있습니다.",
      code: "AUTH_REQUIRED",
    };
  }

  const supabase = await createClient();

  const { data: reviewRows, error: reviewsError } = await supabase
    .from("reviews")
    .select("rating, content")
    .eq("product_id", productId);

  if (reviewsError) {
    // eslint-disable-next-line no-console
    console.error("[generateAiReviewSummary] 리뷰 조회 실패:", reviewsError);
    return {
      success: false,
      error: "리뷰 조회에 실패했습니다.",
      code: "DB_ERROR",
    };
  }

  const reviews = (reviewRows as ReviewRow[]).filter((review) => {
    if (review.content == null) return false;
    const contentText = String(review.content).trim();
    return contentText.length > 0;
  });

  if (reviews.length === 0) {
    return {
      success: false,
      error: "요약을 생성할 리뷰가 없습니다.",
      code: "NO_REVIEWS",
    };
  }

  let summary: ReviewSummaryResult;
  try {
    summary = await generateFullReviewSummary(
      reviews.map((review) => ({
        rating: review.rating,
        content: String(review.content),
      }))
    );
  } catch (aiError) {
    // eslint-disable-next-line no-console
    console.error("[generateAiReviewSummary] AI 요약 생성 실패:", aiError);
    return {
      success: false,
      error: "AI 리뷰 요약 생성에 실패했습니다.",
      code: "AI_ERROR",
    };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      review_summary: summary as unknown as ProductRow["review_summary"],
    } as never)
    .eq("id", productId);

  if (updateError) {
    // eslint-disable-next-line no-console
    console.error(
      "[generateAiReviewSummary] 리뷰 요약 업데이트 실패:",
      updateError
    );
    return {
      success: false,
      error: "리뷰 요약 저장에 실패했습니다.",
      code: "DB_ERROR",
    };
  }

  revalidatePath(`/products/${productId}`);

  return {
    success: true,
    summary,
  };
}

export type ReviewStats = {
  reviewCount: number;
  ratingVariance: number;
  averageReviewLength: number;
  summaryStability: number;
};

/**
 * 신뢰도 계산용 리뷰 통계 (0~1 정규화)
 */
export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const supabase = await createClient();
  const { data: reviewRows, error } = await supabase
    .from("reviews")
    .select("rating, content")
    .eq("product_id", productId);

  if (error || !reviewRows?.length) {
    return {
      reviewCount: 0,
      ratingVariance: 0,
      averageReviewLength: 0,
      summaryStability: 0.5,
    };
  }

  const reviews = (reviewRows as ReviewRow[]).filter((r) => {
    if (r.content == null) return false;
    return String(r.content).trim().length > 0;
  });
  const count = reviews.length;
  const reviewCount = count >= 5 ? 1 : count / 5;

  const ratings = reviews.map((r) => r.rating);
  const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const variance =
    ratings.reduce((acc, r) => acc + (r - mean) ** 2, 0) / ratings.length;
  const maxVariance = 4;
  const ratingVariance = Math.max(0, 1 - variance / maxVariance);

  const totalLen = reviews.reduce(
    (acc, r) => acc + String(r.content ?? "").length,
    0
  );
  const avgLen = count > 0 ? totalLen / count : 0;
  const averageReviewLength = Math.min(avgLen / 500, 1);

  return {
    reviewCount,
    ratingVariance,
    averageReviewLength,
    summaryStability: 0.5,
  };
}

/**
 * 기존 요약으로 되돌리기 (거부 시 호출)
 */
export async function updateReviewSummary(
  productId: string,
  summary: ReviewSummaryResult
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) {
    return { success: false, error: "권한이 없습니다." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      review_summary: summary as unknown as ProductRow["review_summary"],
    } as never)
    .eq("id", productId);
  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath(`/products/${productId}`);
  return { success: true };
}
