import { createClient } from "@/lib/supabase/server";
import type { ProductDetail } from "@/commons/types/product";
import type { Database } from "@/types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * 상품 ID로 상품 상세 정보를 조회합니다.
 * @param productId - 조회할 상품 ID
 * @returns 상품 상세 정보 또는 null (상품이 없거나 hidden 상태인 경우)
 */
export async function getProductById(
  productId: string
): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .neq("status", "hidden")
    .single();

  if (error) {
    // 상품이 없거나 hidden 상태인 경우
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`상품 조회 실패: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as ProductRow;

  // ProductDetail 타입으로 매핑
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    image_url: row.image_url,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    additional_info: row.additional_info,
    measurements: row.measurements,
    categories: null, // TODO: 나중에 categories 테이블과 조인하여 가져오기
    rating: row.rating_average ? Number(row.rating_average) : undefined,
    reviewCount: undefined, // TODO: 나중에 review_summary에서 가져오기
  };
}
