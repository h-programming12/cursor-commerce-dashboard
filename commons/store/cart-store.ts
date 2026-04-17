import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductStatus = "visible" | "hidden" | "sold_out";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  salePrice: number | null;
  status?: ProductStatus;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  getTotal: () => number;
  addItem: (
    product: Omit<CartItem, "quantity">,
    quantity?: number
  ) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => void;
  syncWithServer: () => Promise<void>;
}

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 2500;

export function calcShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

function computeTotals(items: CartItem[]) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => {
    const itemPrice = item.salePrice ?? item.price;
    return sum + itemPrice * item.quantity;
  }, 0);
  return { totalQuantity, totalAmount };
}

const CART_API = "/api/cart";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
      getTotal: () => {
        const amount = get().totalAmount;
        return Math.round(amount) + calcShippingFee(amount);
      },

      syncWithServer: async () => {
        try {
          const res = await fetch(CART_API);
          if (res.status === 401) return;
          if (!res.ok) return;
          const data = await res.json();
          const rawItems = data.items ?? [];
          const items: CartItem[] = rawItems.map(
            (row: Record<string, unknown>) => {
              const productId = row.productId as string;
              const productName = row.productName as string;
              const productImageUrl = (row.productImageUrl as string) ?? null;
              const quantity = Number(row.quantity ?? 1);
              const unitPrice = Number(row.unitPrice ?? 0);
              const salePrice =
                row.salePrice !== null && row.salePrice !== undefined
                  ? Number(row.salePrice)
                  : null;
              return {
                id: productId,
                name: productName,
                price: unitPrice,
                quantity,
                imageUrl: productImageUrl,
                salePrice,
              };
            }
          );
          const { totalQuantity, totalAmount } = computeTotals(items);
          set({ items, totalQuantity, totalAmount });
        } catch {
          // 네트워크 등 오류 시 무시
        }
      },

      addItem: async (product, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) => item.id === product.id
        );
        let newItems: CartItem[];
        if (existingIndex >= 0) {
          newItems = currentItems.map((item, i) =>
            i === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...currentItems, { ...product, quantity }];
        }
        const { totalQuantity, totalAmount } = computeTotals(newItems);
        set({ items: newItems, totalQuantity, totalAmount });

        try {
          const res = await fetch(CART_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, quantity }),
          });
          if (res.status === 401) return;
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error ?? "Cart update failed");
          }
        } catch (err) {
          set({ items: currentItems, ...computeTotals(currentItems) });
          throw err;
        }
      },

      updateItemQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const currentItems = get().items;
        const newItems = currentItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
        const { totalQuantity, totalAmount } = computeTotals(newItems);
        set({ items: newItems, totalQuantity, totalAmount });

        try {
          const res = await fetch(CART_API, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
          });
          if (res.status === 401) return;
          if (!res.ok) {
            set({ items: currentItems, ...computeTotals(currentItems) });
            return;
          }
        } catch {
          set({ items: currentItems, ...computeTotals(currentItems) });
        }
      },

      removeItem: async (productId) => {
        const currentItems = get().items;
        const newItems = currentItems.filter((item) => item.id !== productId);
        const { totalQuantity, totalAmount } = computeTotals(newItems);
        set({ items: newItems, totalQuantity, totalAmount });

        try {
          const res = await fetch(
            `${CART_API}?productId=${encodeURIComponent(productId)}`,
            {
              method: "DELETE",
            }
          );
          if (res.status === 401) return;
          if (!res.ok) {
            set({ items: currentItems, ...computeTotals(currentItems) });
          }
        } catch {
          set({ items: currentItems, ...computeTotals(currentItems) });
        }
      },

      clear: () => set({ items: [], totalQuantity: 0, totalAmount: 0 }),
    }),
    { name: "commerce_cart_v1" }
  )
);
