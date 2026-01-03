/**
 * Supabase 클라이언트 사용 예시
 *
 * 이 파일은 Supabase 클라이언트를 사용하는 방법을 보여주는 예시입니다.
 * 실제 프로덕션 코드에서는 이 파일을 참고하여 구현하세요.
 */

// ============================================
// 1. 클라이언트 컴포넌트에서 데이터 가져오기
// ============================================

/**
 * 예시: 상품 목록 조회
 *
 * 클라이언트 컴포넌트에서 getSupabaseBrowserClient()를 사용하여
 * products 테이블에서 데이터를 가져옵니다.
 *
 * @example
 * ```tsx
 * "use client";
 *
 * import { useEffect, useState } from "react";
 * import { getSupabaseBrowserClient } from "@/lib/supabase/client";
 * import type { Database } from "@/types/supabase";
 *
 * type Product = Database["public"]["Tables"]["products"]["Row"];
 *
 * export function ProductList() {
 *   const [products, setProducts] = useState<Product[]>([]);
 *   const [loading, setLoading] = useState(true);
 *
 *   useEffect(() => {
 *     async function fetchProducts() {
 *       const supabase = getSupabaseBrowserClient();
 *       const { data, error } = await supabase
 *         .from("products")
 *         .select("*")
 *         .eq("status", "registered");
 *
 *       if (error) {
 *         console.error("상품 조회 실패:", error);
 *         return;
 *       }
 *
 *       setProducts(data || []);
 *       setLoading(false);
 *     }
 *
 *     fetchProducts();
 *   }, []);
 *
 *   if (loading) return <div>로딩 중...</div>;
 *
 *   return (
 *     <div>
 *       {products.map((product) => (
 *         <div key={product.id}>{product.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================
// 2. 서버 액션에서 데이터 생성
// ============================================

/**
 * 예시: 주문 생성
 *
 * 서버 액션이나 Route Handler에서 createClient()를 사용하여
 * orders 테이블에 데이터를 삽입합니다.
 *
 * @example
 * ```tsx
 * "use server";
 *
 * import { createClient } from "@/lib/supabase/server";
 * import type { Database } from "@/types/supabase";
 *
 * type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
 * type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];
 *
 * export async function createOrder(
 *   userId: string,
 *   items: { productId: string; quantity: number; unitPrice: number }[]
 * ) {
 *   const supabase = await createClient();
 *
 *   // 주문 생성
 *   const orderData: OrderInsert = {
 *     user_id: userId,
 *     status: "pending",
 *     total_price: items.reduce(
 *       (sum, item) => sum + item.quantity * item.unitPrice,
 *       0
 *     ),
 *   };
 *
 *   const { data: order, error: orderError } = await supabase
 *     .from("orders")
 *     .insert(orderData)
 *     .select()
 *     .single();
 *
 *   if (orderError || !order) {
 *     throw new Error("주문 생성 실패");
 *   }
 *
 *   // 주문 아이템 생성
 *   const orderItems: OrderItemInsert[] = items.map((item) => ({
 *     order_id: order.id,
 *     product_id: item.productId,
 *     quantity: item.quantity,
 *     unit_price: item.unitPrice,
 *   }));
 *
 *   const { error: itemsError } = await supabase
 *     .from("order_items")
 *     .insert(orderItems);
 *
 *   if (itemsError) {
 *     throw new Error("주문 아이템 생성 실패");
 *   }
 *
 *   return { orderId: order.id };
 * }
 * ```
 */

// ============================================
// 3. Route Handler에서 사용
// ============================================

/**
 * 예시: API Route에서 사용
 *
 * Route Handler에서 createClient()를 사용하여
 * 서버 사이드에서 데이터를 조회하거나 수정합니다.
 *
 * @example
 * ```tsx
 * import { NextResponse } from "next/server";
 * import { createClient } from "@/lib/supabase/server";
 *
 * export async function GET() {
 *   const supabase = await createClient();
 *
 *   const { data, error } = await supabase
 *     .from("products")
 *     .select("*")
 *     .eq("status", "registered");
 *
 *   if (error) {
 *     return NextResponse.json(
 *       { error: "상품 조회 실패" },
 *       { status: 500 }
 *     );
 *   }
 *
 *   return NextResponse.json({ products: data });
 * }
 * ```
 */

// ============================================
// TODO: 향후 구현 예정
// ============================================

/**
 * TODO: Auth 연동
 *
 * - 사용자 인증/인가 기능 추가 예정
 * - Row Level Security (RLS) 정책 설정 예정
 * - 세션 관리 및 보안 강화 예정
 *
 * 현재는 기본적인 데이터 조회/생성만 가능합니다.
 * 프로덕션 환경에서는 반드시 RLS를 설정하고
 * 적절한 인증 체계를 구축해야 합니다.
 */
