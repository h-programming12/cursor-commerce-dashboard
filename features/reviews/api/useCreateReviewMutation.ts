"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QUERY_KEYS } from "@/commons/constants/query-keys";

export interface CreateReviewInput {
  productId: string;
  userId: string;
  rating: number;
  content: string;
}

export function useCreateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateReviewInput>({
    mutationFn: async (input: CreateReviewInput) => {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase.from("reviews").insert({
        product_id: input.productId,
        user_id: input.userId,
        rating: input.rating,
        content: input.content || null,
      } as never);

      if (error) {
        throw new Error(`리뷰 작성 실패: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.product(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.list(variables.productId),
      });
    },
  });
}
