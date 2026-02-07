"use client";

import { useInitCart } from "@/commons/hooks/useInitCart";

/**
 * 장바구니 초기화: localStorage 복원 후 로그인 시 서버와 동기화.
 * CommerceLayout에서 한 번만 마운트.
 */
export function CartInitializer() {
  useInitCart();
  return null;
}
