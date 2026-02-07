export const WISHLIST_PAGE_SIZE = 5;

export type WishlistItem = {
  likeItemId: string;
  productId: string;
  createdAt: string | null;
  name: string;
  imageUrl: string | null;
  status: "registered" | "hidden" | "sold_out";
  price: number;
  salePrice: number | null;
};

export type WishlistPageResult = {
  items: WishlistItem[];
  totalCount: number;
  totalPages: number;
};
