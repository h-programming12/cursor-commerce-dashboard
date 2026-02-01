"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { Database } from "@/types/supabase";

// Reviews 테이블 Row 타입 (supabase.ts에 없으므로 직접 정의)
type ReviewRow = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  content: string | null;
  created_at: string;
};

export interface UseProductRatingResult {
  rating: number;
  reviewCount: number;
}

/**
 * 특정 상품의 별점과 리뷰 수를 조회하는 훅
 * @param productId - 조회할 상품 ID
 * @returns rating (평균 평점), reviewCount (리뷰 수)
 */
export function useProductRating(productId: string) {
  return useQuery<UseProductRatingResult>({
    queryKey: QUERY_KEYS.reviews.product(productId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      // 1. products 테이블에서 rating_average 가져오기
      const { data: productData, error: productError } = (await supabase
        .from("products")
        .select("rating_average")
        .eq("id", productId)
        .single()) as {
        data: Pick<
          Database["public"]["Tables"]["products"]["Row"],
          "rating_average"
        > | null;
        error: { message: string } | null;
      };

      if (productError) {
        throw new Error(`상품 조회 실패: ${productError.message}`);
      }

      // 2. reviews 테이블에서 해당 상품의 모든 리뷰 가져오기
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId);

      if (reviewsError) {
        throw new Error(`리뷰 조회 실패: ${reviewsError.message}`);
      }

      const reviews = (reviewsData || []) as ReviewRow[];
      const reviewCount = reviews.length;

      // 3. 평균 평점 계산
      // products 테이블의 rating_average가 있으면 우선 사용
      // 없으면 reviews에서 계산
      let rating = 0;

      if (productData?.rating_average) {
        rating = Number(productData.rating_average);
      } else if (reviewCount > 0) {
        // reviews에서 평균 계산
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        rating = sum / reviewCount;
      }

      return {
        rating,
        reviewCount,
      };
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}
