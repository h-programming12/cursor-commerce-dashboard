"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { AuthRequiredError } from "./errors";
import { COMMERCE_URLS } from "@/commons/constants/url";

type LikeItemInsert = Database["public"]["Tables"]["like_items"]["Insert"];

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new AuthRequiredError();
  }
  return session.user.id;
}

/**
 * 해당 상품이 현재 사용자 찜 목록에 있는지 여부.
 * 비로그인 시 false 반환.
 */
export async function isProductLiked(productId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return false;
    }
    const userId = session.user.id;
    const { data, error } = await supabase
      .from("like_items")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (error) {
      return false;
    }
    return !!data;
  } catch {
    return false;
  }
}

/**
 * 찜하기 추가
 */
export async function addLikeItem(productId: string): Promise<void> {
  const userId = await getUserId();
  const supabase = await createClient();
  const row: LikeItemInsert = {
    user_id: userId,
    product_id: productId,
  };
  const { error } = await supabase.from("like_items").insert(row as never);

  if (error) {
    if (error.code === "23505") {
      revalidatePath(COMMERCE_URLS.PRODUCT_DETAIL(productId));
      revalidatePath(COMMERCE_URLS.PRODUCTS);
      revalidatePath(COMMERCE_URLS.HOME);
      return;
    }
    throw new Error(`찜하기 추가 실패: ${error.message}`);
  }

  revalidatePath(COMMERCE_URLS.PRODUCT_DETAIL(productId));
  revalidatePath(COMMERCE_URLS.PRODUCTS);
  revalidatePath(COMMERCE_URLS.HOME);
}

/**
 * 찜하기 제거
 */
export async function removeLikeItem(productId: string): Promise<void> {
  const userId = await getUserId();
  const supabase = await createClient();
  const { error } = await supabase
    .from("like_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(`찜하기 제거 실패: ${error.message}`);
  }

  revalidatePath(COMMERCE_URLS.PRODUCT_DETAIL(productId));
  revalidatePath(COMMERCE_URLS.PRODUCTS);
  revalidatePath(COMMERCE_URLS.HOME);
}

export type ToggleLikeResult =
  | { success: true; isLiked: boolean }
  | { success: false; code: "AUTH_REQUIRED"; message: string }
  | { success: false; code: "ERROR"; message: string };

/**
 * 찜하기 토글. 현재 찜 여부에 따라 추가/제거 후 새 상태 반환.
 * 로그인 필요 시 throw 대신 결과 객체로 반환하여 클라이언트에서 메시지/리다이렉트 처리 가능.
 */
export async function toggleLikeItem(
  productId: string
): Promise<ToggleLikeResult> {
  try {
    const liked = await isProductLiked(productId);
    if (liked) {
      await removeLikeItem(productId);
      return { success: true, isLiked: false };
    }
    await addLikeItem(productId);
    return { success: true, isLiked: true };
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return {
        success: false,
        code: "AUTH_REQUIRED",
        message: error.message,
      };
    }
    const message =
      error instanceof Error
        ? error.message
        : "찜하기 처리 중 오류가 발생했습니다.";
    return { success: false, code: "ERROR", message };
  }
}
