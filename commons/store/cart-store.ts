import { create } from "zustand";
import { persist } from "zustand/middleware";

// ProductStatus 타입 정의
export type ProductStatus = "visible" | "hidden" | "sold_out";

// CartItem 타입 정의 (Supabase products 테이블과 일치)
export interface CartItem {
  id: string; // productId, Supabase products.id
  name: string;
  price: number; // products.price와 매핑
  quantity: number;
  imageUrl: string | null; // products.image_url와 매핑
  salePrice: number | null; // products.sale_price와 매핑
  status?: ProductStatus; // 선택적 필드
}

// CartState 인터페이스
export interface CartState {
  items: CartItem[];
  totalQuantity: number; // 자동 계산
  totalAmount: number; // 자동 계산, salePrice 우선
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

// 장바구니 스토어 생성
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      totalAmount: 0,

      // 상품 추가: 이미 같은 id가 있으면 quantity만 증가, 없으면 새 항목 추가
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.id === product.id
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // 기존 항목이 있으면 quantity만 증가
          newItems = currentItems.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // 새 항목 추가
          newItems = [...currentItems, { ...product, quantity }];
        }

        // totalQuantity와 totalAmount 자동 계산
        const totalQuantity = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalAmount = newItems.reduce((sum, item) => {
          const itemPrice = item.salePrice ?? item.price;
          return sum + itemPrice * item.quantity;
        }, 0);

        set({ items: newItems, totalQuantity, totalAmount });
      },

      // 상품 수량 업데이트: quantity가 0 이하로 내려가면 해당 아이템 제거
      updateItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          // quantity가 0 이하이면 removeItem 호출
          get().removeItem(productId);
          return;
        }

        const currentItems = get().items;
        const newItems = currentItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );

        // totalQuantity와 totalAmount 자동 계산
        const totalQuantity = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalAmount = newItems.reduce((sum, item) => {
          const itemPrice = item.salePrice ?? item.price;
          return sum + itemPrice * item.quantity;
        }, 0);

        set({ items: newItems, totalQuantity, totalAmount });
      },

      // 상품 제거
      removeItem: (productId) => {
        const currentItems = get().items;
        const newItems = currentItems.filter((item) => item.id !== productId);

        // totalQuantity와 totalAmount 자동 계산
        const totalQuantity = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalAmount = newItems.reduce((sum, item) => {
          const itemPrice = item.salePrice ?? item.price;
          return sum + itemPrice * item.quantity;
        }, 0);

        set({ items: newItems, totalQuantity, totalAmount });
      },

      // 장바구니 비우기
      clear: () => {
        set({ items: [], totalQuantity: 0, totalAmount: 0 });
      },
    }),
    {
      name: "commerce_cart_v1", // localStorage key
    }
  )
);
