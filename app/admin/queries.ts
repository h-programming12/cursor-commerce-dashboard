import { createClient } from "@/lib/supabase/server";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function getTodayOrderCount(): Promise<number> {
  const supabase = await createClient();
  const { start, end } = getTodayRange();
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", start)
    .lt("created_at", end);

  if (error) return 0;
  return count ?? 0;
}

type OrderItemRow = { product_id: string; quantity: number };

export async function getBestSellingProducts(limit: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_items")
    .select("product_id, quantity");
  const rows = (data ?? []) as OrderItemRow[];

  const byProduct = new Map<string, number>();
  for (const row of rows) {
    const cur = byProduct.get(row.product_id) ?? 0;
    byProduct.set(row.product_id, cur + row.quantity);
  }

  const sorted = [...byProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const productIds = sorted.map(([id]) => id);

  if (productIds.length === 0) return [];

  const { data: productsData } = await supabase
    .from("products")
    .select("id, name, image_url")
    .in("id", productIds);

  type ProductSelect = { id: string; name: string; image_url: string | null };
  const products = (productsData ?? []) as ProductSelect[];
  const productMap = new Map<string, ProductSelect>();
  for (const p of products) {
    productMap.set(p.id, p);
  }

  return sorted.map(([product_id, total_quantity]) => {
    const p = productMap.get(product_id);
    return {
      product_id,
      product_name: p?.name ?? "",
      image_url: p?.image_url ?? null,
      total_quantity,
    };
  });
}

type LikeItemRow = { product_id: string };

export async function getTrendingProducts(limit: number) {
  const supabase = await createClient();
  const { data } = await supabase.from("like_items").select("product_id");
  const rows = (data ?? []) as LikeItemRow[];

  const byProduct = new Map<string, number>();
  for (const row of rows) {
    const cur = byProduct.get(row.product_id) ?? 0;
    byProduct.set(row.product_id, cur + 1);
  }

  const sorted = [...byProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const productIds = sorted.map(([id]) => id);

  if (productIds.length === 0) return [];

  const { data: productsData } = await supabase
    .from("products")
    .select("id, name, image_url")
    .in("id", productIds);

  type ProductSelect = { id: string; name: string; image_url: string | null };
  const products = (productsData ?? []) as ProductSelect[];
  const productMap = new Map<string, ProductSelect>();
  for (const p of products) {
    productMap.set(p.id, p);
  }

  return sorted.map(([product_id, like_count]) => {
    const p = productMap.get(product_id);
    return {
      product_id,
      product_name: p?.name ?? "",
      image_url: p?.image_url ?? null,
      like_count,
    };
  });
}

export interface RecentOrder {
  id: string;
  user_id: string;
  user_email: string | null;
  status: string;
  total_amount: number;
  created_at: string | null;
}

type OrderSelect = {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string | null;
};
type UserSelect = { id: string; email: string };

export async function getRecentOrders(limit: number): Promise<RecentOrder[]> {
  const supabase = await createClient();
  const { data: ordersData } = await supabase
    .from("orders")
    .select("id, user_id, status, total_amount, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  const orders = (ordersData ?? []) as OrderSelect[];
  if (!orders.length) return [];

  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const { data: usersData } = await supabase
    .from("users")
    .select("id, email")
    .in("id", userIds);

  const users = (usersData ?? []) as UserSelect[];
  const userEmailMap = new Map<string, string>();
  for (const u of users) {
    userEmailMap.set(u.id, u.email);
  }

  return orders.map((o) => ({
    id: o.id,
    user_id: o.user_id,
    user_email: userEmailMap.get(o.user_id) ?? null,
    status: o.status,
    total_amount: o.total_amount,
    created_at: o.created_at,
  }));
}
