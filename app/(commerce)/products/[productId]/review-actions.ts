"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

const MIN_CONTENT_LENGTH = 10;
const RATING_MIN = 1;
const RATING_MAX = 5;

/** 리뷰 생성 실패 시 클라이언트에서 분기 처리용 코드 */
export type CreateReviewErrorCode =
  | "AUTH_REQUIRED"
  | "VALIDATION"
  | "DUPLICATE"
  | "UNKNOWN";

export type CreateReviewResult =
  | { success: true }
  | { success: false; error: string; code: CreateReviewErrorCode };

export async function createReview(
  productId: string,
  formData: FormData
): Promise<CreateReviewResult> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !authUser) {
    return {
      success: false,
      error: "로그인이 필요합니다.",
      code: "AUTH_REQUIRED",
    };
  }

  const ratingRaw = formData.get("rating");
  const contentRaw = formData.get("content");

  const rating =
    typeof ratingRaw === "string" ? parseInt(ratingRaw, 10) : Number(ratingRaw);
  const content = typeof contentRaw === "string" ? contentRaw.trim() : "";

  if (!Number.isInteger(rating) || rating < RATING_MIN || rating > RATING_MAX) {
    return {
      success: false,
      error: "평점은 1~5 사이로 선택해 주세요.",
      code: "VALIDATION",
    };
  }

  if (content.length < MIN_CONTENT_LENGTH) {
    return {
      success: false,
      error: `리뷰 내용은 최소 ${MIN_CONTENT_LENGTH}자 이상 입력해 주세요.`,
      code: "VALIDATION",
    };
  }

  const userId = authUser.id;

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "이미 이 상품에 리뷰를 작성하셨습니다.",
      code: "DUPLICATE",
    };
  }

  const reviewRow: Database["public"]["Tables"]["reviews"]["Insert"] = {
    product_id: productId,
    user_id: userId,
    rating,
    content: content || null,
  };
  const { error: insertError } = await supabase
    .from("reviews")
    .insert(reviewRow as never);

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "이미 이 상품에 리뷰를 작성하셨습니다.",
        code: "DUPLICATE",
      };
    }
    return {
      success: false,
      error: `리뷰 작성 실패: ${insertError.message}`,
      code: "UNKNOWN",
    };
  }

  revalidatePath(`/products/${productId}`);
  return { success: true };
}

/** 리뷰 수정/삭제 실패 시 클라이언트에서 분기 처리용 코드 */
export type ReviewMutationErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "VALIDATION"
  | "UNKNOWN";

export type UpdateReviewResult =
  | { success: true }
  | { success: false; error: string; code: ReviewMutationErrorCode };

export async function updateReview(
  reviewId: string,
  productId: string,
  rating: number,
  content: string
): Promise<UpdateReviewResult> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !authUser) {
    return {
      success: false,
      error: "로그인이 필요합니다.",
      code: "AUTH_REQUIRED",
    };
  }

  if (!Number.isInteger(rating) || rating < RATING_MIN || rating > RATING_MAX) {
    return {
      success: false,
      error: "평점은 1~5 사이로 선택해 주세요.",
      code: "VALIDATION",
    };
  }

  if (content.trim().length < MIN_CONTENT_LENGTH) {
    return {
      success: false,
      error: `리뷰 내용은 최소 ${MIN_CONTENT_LENGTH}자 이상 입력해 주세요.`,
      code: "VALIDATION",
    };
  }

  type ReviewRow = Pick<
    Database["public"]["Tables"]["reviews"]["Row"],
    "id" | "user_id"
  >;
  const { data } = await supabase
    .from("reviews")
    .select("id, user_id")
    .eq("id", reviewId)
    .eq("product_id", productId)
    .maybeSingle();
  const reviewRow = data as ReviewRow | null;

  if (!reviewRow) {
    return {
      success: false,
      error: "리뷰를 찾을 수 없습니다.",
      code: "NOT_FOUND",
    };
  }

  if (reviewRow.user_id !== authUser.id) {
    return {
      success: false,
      error: "본인의 리뷰만 수정할 수 있습니다.",
      code: "FORBIDDEN",
    };
  }

  const updatePayload = { rating, content: content.trim() || null };
  const { error: updateError } = await supabase
    .from("reviews")
    .update(updatePayload as never)
    .eq("id", reviewId)
    .eq("product_id", productId)
    .eq("user_id", authUser.id);

  if (updateError) {
    return {
      success: false,
      error: `리뷰 수정 실패: ${updateError.message}`,
      code: "UNKNOWN",
    };
  }

  revalidatePath(`/products/${productId}`);
  return { success: true };
}

export type DeleteReviewResult =
  | { success: true }
  | { success: false; error: string; code: ReviewMutationErrorCode };

export async function deleteReview(
  reviewId: string,
  productId: string
): Promise<DeleteReviewResult> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !authUser) {
    return {
      success: false,
      error: "로그인이 필요합니다.",
      code: "AUTH_REQUIRED",
    };
  }

  type ReviewRow = Pick<
    Database["public"]["Tables"]["reviews"]["Row"],
    "id" | "user_id"
  >;
  const { data: deleteReviewData } = await supabase
    .from("reviews")
    .select("id, user_id")
    .eq("id", reviewId)
    .eq("product_id", productId)
    .maybeSingle();
  const deleteReviewRow = deleteReviewData as ReviewRow | null;

  if (!deleteReviewRow) {
    return {
      success: false,
      error: "리뷰를 찾을 수 없습니다.",
      code: "NOT_FOUND",
    };
  }

  if (deleteReviewRow.user_id !== authUser.id) {
    return {
      success: false,
      error: "본인의 리뷰만 삭제할 수 있습니다.",
      code: "FORBIDDEN",
    };
  }

  const { error: deleteError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("product_id", productId)
    .eq("user_id", authUser.id);

  if (deleteError) {
    return {
      success: false,
      error: `리뷰 삭제 실패: ${deleteError.message}`,
      code: "UNKNOWN",
    };
  }

  revalidatePath(`/products/${productId}`);
  return { success: true };
}
