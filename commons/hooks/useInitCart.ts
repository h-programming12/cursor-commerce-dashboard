"use client";

import { useEffect } from "react";
import { useCartStore } from "@/commons/store/cart-store";
import { useAuth } from "@/commons/hooks/useAuth";

/**
 * localStorage에서 장바구니 복원 후, 로그인 상태면 서버와 동기화.
 * CommerceLayout의 CartInitializer에서 한 번만 호출.
 */
export function useInitCart() {
  const syncWithServer = useCartStore((state) => state.syncWithServer);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      syncWithServer();
    }
  }, [isAuthenticated, syncWithServer]);
}
