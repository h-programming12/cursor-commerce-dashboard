"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
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
  const date = new Date(isoString);
  return date.toLocaleDateString("ko-KR", {
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

export interface UseProductReviewsListResult {
  reviews: Review[];
  totalCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * 상품별 리뷰 목록을 페이지네이션으로 조회하는 훅
 */
export function useProductReviewsList(
  productId: string
): UseProductReviewsListResult {
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.reviews.list(productId),
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = getSupabaseBrowserClient();
      const from = pageParam * REVIEWS_PAGE_SIZE;
      const to = from + REVIEWS_PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, user_id, product_id, rating, content, created_at, users(display_name)"
        )
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(`리뷰 목록 조회 실패: ${error.message}`);
      }

      const rows = (data ?? []) as ReviewRow[];
      return {
        reviews: rows.map(mapRowToReview),
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.reviews.length < REVIEWS_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled: !!productId,
  });

  const reviews = query.data?.pages.flatMap((p) => p.reviews) ?? [];
  const lastPage = query.data?.pages[query.data.pages.length - 1];
  const hasNextPage =
    (query.hasNextPage ?? false) &&
    lastPage?.reviews.length === REVIEWS_PAGE_SIZE;

  return {
    reviews,
    totalCount: reviews.length,
    hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
