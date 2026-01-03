import type { CartItem } from "@/components/commerce/types";

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  itemCount: number;
}
