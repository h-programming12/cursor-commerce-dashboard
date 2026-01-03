export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  salePrice?: number;
  image_url: string | null;
  status: "registered" | "hidden" | "sold_out";
  created_at: string | null;
  updated_at: string | null;
  additional_info?: string | null;
  measurements?: string | null;
  categories?: ProductCategory[] | null;
  rating?: number;
  reviewCount?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
}
