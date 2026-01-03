export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  isLiked?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
