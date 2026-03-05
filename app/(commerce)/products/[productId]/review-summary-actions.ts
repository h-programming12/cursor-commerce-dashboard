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
