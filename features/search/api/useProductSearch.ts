"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Product } from "@/components/commerce/types";
import type { Database } from "@/types/supabase";
import { useDebouncedValue } from "@/commons/hooks/useDebouncedValue";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export function useProductSearch(keyword: string) {
  const debouncedKeyword = useDebouncedValue(keyword, 350);

  return useQuery<Product[]>({
    queryKey: ["products", "search", debouncedKeyword],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("status", "hidden")
        .or(
          `name.ilike.%${debouncedKeyword}%,description.ilike.%${debouncedKeyword}%`
        );

      if (error) {
        throw new Error(`상품 검색 실패: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Supabase row를 Product 타입으로 매핑
      return (data as ProductRow[]).map((row) => ({
        id: row.id,
        name: row.name,
        price: Number(row.price),
        salePrice: row.sale_price ? Number(row.sale_price) : undefined,
        imageUrl: row.image_url || "",
        rating: row.rating_average ? Number(row.rating_average) : undefined,
        reviewCount: undefined, // 나중에 별도 조회 필요
      }));
    },
    enabled: debouncedKeyword.length > 0,
  });
}
