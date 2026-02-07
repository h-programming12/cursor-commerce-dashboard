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
