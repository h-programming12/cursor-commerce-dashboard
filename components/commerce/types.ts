export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  isLiked?: boolean;
  badges?: Array<{ label: string; variant: "new" | "sale" | "discount" }>;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface OrderSummaryItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ShippingOption {
  label: string;
  price: number;
  selected: boolean;
}
