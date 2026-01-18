"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { Product } from "@/components/commerce/types";
import type { Database } from "@/types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const PAGE_SIZE = 12;

type InfiniteProductsPage = {
  items: Product[];
};

export function useInfiniteProducts() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.products.infinite(),
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      const supabase = getSupabaseBrowserClient();
      const offset = pageParam * PAGE_SIZE;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("status", "hidden")
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        throw new Error(`상품 조회 실패: ${error.message}`);
      }

      if (!data) {
        return {
          items: [],
        };
      }

      // Supabase row를 Product 타입으로 매핑
      const items: Product[] = (data as ProductRow[]).map((row) => ({
        id: row.id,
        name: row.name,
        price: Number(row.price),
        salePrice: row.sale_price ? Number(row.sale_price) : undefined,
        imageUrl: row.image_url || "",
        rating: row.rating_average ? Number(row.rating_average) : undefined,
        reviewCount: undefined, // 나중에 별도 조회 필요
      }));

      return {
        items,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      // lastPage의 items 길이가 PAGE_SIZE보다 적으면 undefined 반환
      if (lastPage.items.length < PAGE_SIZE) {
        return undefined;
      }
      // 그렇지 않으면 allPages.length 반환
      return allPages.length;
    },
    initialPageParam: 0,
  });
}
