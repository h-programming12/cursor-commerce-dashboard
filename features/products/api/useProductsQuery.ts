"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { Product } from "@/components/commerce/types";
import type { Database } from "@/types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export type UseProductsParams = {
  limit?: number;
  search?: string; // 나중에 확장할 여지를 남김
};

export function useProductsQuery(params?: UseProductsParams) {
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.products.list(params || {}),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      let query = supabase.from("products").select("*").neq("status", "hidden");

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      // TODO: search 파라미터 구현
      // if (params?.search) {
      //   query = query.ilike("name", `%${params.search}%`);
      // }

      const { data, error } = await query;

      if (error) {
        throw new Error(`상품 조회 실패: ${error.message}`);
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
    enabled: true,
  });
}

// 사용 예시:
// const {
//   data: products,
//   isLoading,
//   isError,
// } = useProductsQuery({ limit: 20 });
// if (isLoading) return <div>로딩 중...</div>;
// if (isError) return <div>오류 발생</div>;
// return <ProductGrid products={products ?? []} />;
