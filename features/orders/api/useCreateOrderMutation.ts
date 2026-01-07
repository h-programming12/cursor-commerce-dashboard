"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import type { CreateOrderInput, CreateOrderResult } from "./types";
import type { Database } from "@/types/supabase";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResult, Error, CreateOrderInput>({
    mutationFn: async (input: CreateOrderInput) => {
      const supabase = getSupabaseBrowserClient();

      // 총액 계산
      const totalAmount = input.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );

      // orders 테이블에 insert
      // 실제 스키마는 total_amount이지만 타입은 total_price로 되어 있음
      const orderInsert: OrderInsert = {
        user_id: input.userId,
        status: "pending",
        total_price: totalAmount,
      };

      const { data: orderData, error: orderError } = (await supabase
        .from("orders")
        .insert(orderInsert as never)
        .select()
        .single()) as {
        data: OrderRow | null;
        error: { message: string } | null;
      };

      if (orderError) {
        throw new Error(`주문 생성 실패: ${orderError.message}`);
      }

      if (!orderData) {
        throw new Error("주문 생성 실패: 주문 데이터가 없습니다");
      }

      const orderRow = orderData as OrderRow;

      // order_items 테이블에 insert
      const orderItems: OrderItemInsert[] = input.items.map((item) => ({
        order_id: orderRow.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const { error: itemsError } = (await supabase
        .from("order_items")
        .insert(orderItems as never[])) as {
        error: { message: string } | null;
      };

      if (itemsError) {
        throw new Error(`주문 아이템 생성 실패: ${itemsError.message}`);
      }

      return {
        orderId: orderRow.id,
      };
    },
    onSuccess: () => {
      // 주문 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
    },
  });
}

// 사용 예시:
// const { mutate, mutateAsync, isPending, isSuccess, isError, error } = useCreateOrderMutation();
// mutate({ userId: "user-id", items: [{ productId: "prod-id", quantity: 2, unitPrice: 10000 }] });
// 또는
// const result = await mutateAsync({ userId: "user-id", items: [...] });
