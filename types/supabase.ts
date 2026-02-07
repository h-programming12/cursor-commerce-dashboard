export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: "user" | "admin";
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          role?: "user" | "admin";
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          role?: "user" | "admin";
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          image_url: string | null;
          status: "registered" | "hidden" | "sold_out";
          created_at: string | null;
          updated_at: string | null;
          additional_info: string | null;
          measurements: string | null;
          categories: string[] | null;
          rating_average: number | null;
          review_summary: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: "registered" | "hidden" | "sold_out";
          created_at?: string | null;
          updated_at?: string | null;
          additional_info?: string | null;
          measurements?: string | null;
          categories?: string[] | null;
          rating_average?: number | null;
          review_summary?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          image_url?: string | null;
          status?: "registered" | "hidden" | "sold_out";
          created_at?: string | null;
          updated_at?: string | null;
          additional_info?: string | null;
          measurements?: string | null;
          categories?: string[] | null;
          rating_average?: number | null;
          review_summary?: Json | null;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          total_price: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          total_price: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          total_price?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          created_at?: string | null;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      like_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          rating: number;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          rating: number;
          content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          rating?: number;
          content?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
