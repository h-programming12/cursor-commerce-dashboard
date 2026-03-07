"use server";

import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/components/commerce/types";

const REVIEWS_PAGE_SIZE = 5;

type ReviewRow = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  users: { display_name: string | null } | null;
};

function formatReviewDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function mapRowToReview(row: ReviewRow): Review {
  const displayName = row.users?.display_name?.trim() || "닉네임 없음";
  return {
    id: row.id,
    userId: row.user_id,
    userName: displayName,
    userAvatar: undefined,
    rating: row.rating,
    comment: row.content ?? "",
    date: formatReviewDate(row.created_at),
  };
}

export interface ProductReviewsFirstPageResult {
  reviews: Review[];
  hasNextPage: boolean;
  totalCount: number;
}

export async function getProductReviewsFirstPage(
  productId: string
): Promise<ProductReviewsFirstPageResult> {
  const supabase = await createClient();

  const { count: totalCount, error: countError } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (countError) {
    return { reviews: [], hasNextPage: false, totalCount: 0 };
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, user_id, product_id, rating, content, created_at, users(display_name)"
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .range(0, REVIEWS_PAGE_SIZE - 1);

  if (error) {
    return { reviews: [], hasNextPage: false, totalCount: totalCount ?? 0 };
  }

  const rows = (data ?? []) as ReviewRow[];
  const reviews = rows.map(mapRowToReview);
  const hasNextPage = (totalCount ?? 0) > REVIEWS_PAGE_SIZE;

  return {
    reviews,
    hasNextPage,
    totalCount: totalCount ?? 0,
  };
}
