import { createClient } from "@/lib/supabase/server";

export interface McpSettings {
  id: string;
  slack_enabled: boolean;
  notion_enabled: boolean;
  notion_url: string | null;
  notion_report_per_payment: boolean;
  notion_report_monthly_manual: boolean;
  notion_report_monthly_auto: boolean;
  created_at: string | null;
  updated_at: string | null;
}

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

export async function getMcpSettings(): Promise<McpSettings> {
  const supabase = await createClient();

  const { data: existing, error: selectError } = await supabase
    .from("mcp_settings")
    .select(
      "id, slack_enabled, notion_enabled, notion_url, notion_report_per_payment, notion_report_monthly_manual, notion_report_monthly_auto, created_at, updated_at"
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (selectError && selectError.code !== "PGRST116") {
    // PGRST116: No rows found for maybeSingle
    throw new Error(selectError.message);
  }

  if (existing) {
    return existing as unknown as McpSettings;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("mcp_settings")
    .insert({
      slack_enabled: false,
      notion_enabled: false,
      notion_url: null,
      notion_report_per_payment: false,
      notion_report_monthly_manual: false,
      notion_report_monthly_auto: false,
    } as never)
    .select(
      "id, slack_enabled, notion_enabled, notion_url, notion_report_per_payment, notion_report_monthly_manual, notion_report_monthly_auto, created_at, updated_at"
    )
    .maybeSingle();

  if (insertError || !inserted) {
    throw new Error(
      insertError?.message ?? "mcp_settings 초기화에 실패했습니다."
    );
  }

  return inserted as unknown as McpSettings;
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

// --- 유저/관리자/결제 리스트·상세 ---

export type UserListRoleFilter = "all" | "user" | "admin";

export interface UserListItem {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string | null;
  order_count: number;
  total_order_amount: number;
}

export async function getUsersList(
  page: number,
  pageSize: number,
  role: UserListRoleFilter
): Promise<{ data: UserListItem[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("users")
    .select("id, email, display_name, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (role !== "all") {
    q = q.eq("role", role);
  }
  const { data: rows, count, error } = await q.range(from, to);

  if (error) return { data: [], total: 0 };
  const users = (rows ?? []) as {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    created_at: string | null;
  }[];
  const total = count ?? 0;
  if (!users.length) return { data: [], total };

  const userIds = users.map((u) => u.id);
  const { data: orderRows } = await supabase
    .from("orders")
    .select("user_id, total_amount")
    .in("user_id", userIds);

  type OrderAgg = { user_id: string; total_amount: number };
  const orderList = (orderRows ?? []) as OrderAgg[];
  const orderCountMap = new Map<string, number>();
  const totalAmountMap = new Map<string, number>();
  for (const o of orderList) {
    orderCountMap.set(o.user_id, (orderCountMap.get(o.user_id) ?? 0) + 1);
    totalAmountMap.set(
      o.user_id,
      (totalAmountMap.get(o.user_id) ?? 0) + Number(o.total_amount)
    );
  }

  const data: UserListItem[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    role: u.role,
    created_at: u.created_at,
    order_count: orderCountMap.get(u.id) ?? 0,
    total_order_amount: totalAmountMap.get(u.id) ?? 0,
  }));
  return { data, total };
}

export interface AdminListItem {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string | null;
}

export async function getAdminsList(
  page: number,
  pageSize: number
): Promise<{ data: AdminListItem[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data: rows,
    count,
    error,
  } = await supabase
    .from("users")
    .select("id, email, display_name, role, created_at", { count: "exact" })
    .in("role", ["admin", "super_admin"])
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { data: [], total: 0 };
  const data = (rows ?? []) as AdminListItem[];
  return { data, total: count ?? 0 };
}

export interface PaymentListFilters {
  status?: string;
}

export interface PaymentListItem {
  id: string;
  order_id: string;
  user_id: string;
  user_email: string | null;
  provider: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string | null;
  payment_key: string | null;
  approved_at: string | null;
  created_at: string | null;
}

export async function getPaymentsList(
  page: number,
  pageSize: number,
  filters?: PaymentListFilters
): Promise<{ data: PaymentListItem[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("payments")
    .select(
      "id, order_id, user_id, provider, method, amount, currency, status, transaction_id, payment_key, approved_at, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filters?.status) {
    q = q.eq("status", filters.status);
  }
  const { data: rows, count, error } = await q.range(from, to);

  if (error) return { data: [], total: 0 };
  const payments = (rows ?? []) as (PaymentListItem & {
    user_email?: string | null;
  })[];
  const total = count ?? 0;
  if (!payments.length) return { data: [], total };

  const userIds = [...new Set(payments.map((p) => p.user_id))];
  const { data: userRows } = await supabase
    .from("users")
    .select("id, email")
    .in("id", userIds);
  type U = { id: string; email: string };
  const userMap = new Map<string, string>();
  for (const u of (userRows ?? []) as U[]) {
    userMap.set(u.id, u.email);
  }

  const data: PaymentListItem[] = payments.map((p) => ({
    ...p,
    user_email: userMap.get(p.user_id) ?? null,
  }));
  return { data, total };
}

export type OrderListStatusFilter =
  | "all"
  | "pending"
  | "paid"
  | "canceled"
  | "refunded";

export interface OrderListFilters {
  status?: string;
}

export interface OrderListItem {
  id: string;
  user_id: string;
  user_email: string | null;
  status: string;
  total_amount: number;
  payment_status: string;
  created_at: string | null;
}

export async function getOrdersList(
  page: number,
  pageSize: number,
  filters?: OrderListFilters
): Promise<{ data: OrderListItem[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("orders")
    .select("id, user_id, status, total_amount, payment_status, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (filters?.status) {
    q = q.eq("status", filters.status);
  }
  const { data: rows, count, error } = await q.range(from, to);

  if (error) return { data: [], total: 0 };
  const orders = (rows ?? []) as (OrderListItem & {
    user_email?: string | null;
  })[];
  const total = count ?? 0;
  if (!orders.length) return { data: [], total };

  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const { data: userRows } = await supabase
    .from("users")
    .select("id, email")
    .in("id", userIds);
  type U = { id: string; email: string };
  const userMap = new Map<string, string>();
  for (const u of (userRows ?? []) as U[]) {
    userMap.set(u.id, u.email);
  }

  const data: OrderListItem[] = orders.map((o) => ({
    ...o,
    user_email: userMap.get(o.user_id) ?? null,
  }));
  return { data, total };
}

export interface UserDetail {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  order_count: number;
  total_order_amount: number;
}

export async function getUserDetail(
  userId: string
): Promise<UserDetail | null> {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, display_name, role, image_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user) return null;
  type Row = {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    image_url: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  const u = user as Row;

  const { data: orderRows } = await supabase
    .from("orders")
    .select("id, total_amount")
    .eq("user_id", userId);
  type O = { id: string; total_amount: number };
  const orders = (orderRows ?? []) as O[];
  const order_count = orders.length;
  const total_order_amount = orders.reduce(
    (s, o) => s + Number(o.total_amount),
    0
  );

  return {
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    role: u.role,
    image_url: u.image_url,
    created_at: u.created_at,
    updated_at: u.updated_at,
    order_count,
    total_order_amount,
  };
}

export interface AdminDetail {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function getAdminDetail(
  adminId: string
): Promise<AdminDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, display_name, role, image_url, created_at, updated_at")
    .eq("id", adminId)
    .in("role", ["admin", "super_admin"])
    .maybeSingle();

  if (error || !data) return null;
  return data as AdminDetail;
}

export interface PaymentDetail {
  id: string;
  order_id: string;
  user_id: string;
  user_email: string | null;
  provider: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string | null;
  payment_key: string | null;
  approved_at: string | null;
  created_at: string | null;
  order_status?: string;
  order_total_amount?: number;
}

export async function getPaymentDetail(
  paymentId: string
): Promise<PaymentDetail | null> {
  const supabase = await createClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .select(
      "id, order_id, user_id, provider, method, amount, currency, status, transaction_id, payment_key, approved_at, created_at"
    )
    .eq("id", paymentId)
    .maybeSingle();

  if (error || !payment) return null;
  type P = PaymentDetail & {
    order_status?: string;
    order_total_amount?: number;
  };
  const p = payment as P;

  const { data: orderRow } = await supabase
    .from("orders")
    .select("status, total_amount")
    .eq("id", p.order_id)
    .maybeSingle();
  const order = orderRow as { status: string; total_amount: number } | null;

  const { data: userRow } = await supabase
    .from("users")
    .select("email")
    .eq("id", p.user_id)
    .maybeSingle();
  const userEmail = (userRow as { email: string } | null)?.email ?? null;

  return {
    id: p.id,
    order_id: p.order_id,
    user_id: p.user_id,
    user_email: userEmail,
    provider: p.provider,
    method: p.method,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    transaction_id: p.transaction_id,
    payment_key: p.payment_key,
    approved_at: p.approved_at,
    created_at: p.created_at,
    order_status: order?.status,
    order_total_amount: order != null ? Number(order.total_amount) : undefined,
  };
}

export interface OrderDetailItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  sale_price: number | null;
  discount_amount: number | null;
  subtotal: number;
  created_at: string | null;
}

export interface OrderDetailPayment {
  id: string;
  provider: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string | null;
  payment_key: string | null;
  approved_at: string | null;
  created_at: string | null;
}

export interface OrderDetail {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  user_phone: string | null;
  status: string;
  payment_status: string;
  total_amount: number;
  product_total_amount: number | null;
  delivery_fee: number | null;
  discount_total: number | null;
  toss_order_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  receiver_zipcode: string | null;
  receiver_address1: string | null;
  receiver_address2: string | null;
  items: OrderDetailItem[];
  payments: OrderDetailPayment[];
}

export async function getOrderDetail(
  orderId: string
): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !orderData) return null;

  type OrderRow = {
    id: string;
    user_id: string;
    status: string;
    payment_status: string;
    total_amount: number;
    subtotal_amount?: number | null;
    shipping_fee?: number | null;
    discount_amount?: number | null;
    toss_order_id: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    shipping_name: string | null;
    shipping_phone: string | null;
    shipping_address_line1: string | null;
    shipping_address_line2: string | null;
    shipping_city: string | null;
    shipping_state: string | null;
    shipping_zip: string | null;
    shipping_country: string | null;
    created_at: string | null;
    updated_at: string | null;
    paid_at: string | null;
  };

  const o = orderData as unknown as OrderRow;

  const [{ data: userRow }, { data: itemsData }, { data: paymentRows }] =
    await Promise.all([
      supabase
        .from("users")
        .select("email, display_name, phone")
        .eq("id", o.user_id)
        .maybeSingle(),
      supabase.from("order_items").select("*").eq("order_id", orderId),
      supabase
        .from("payments")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false }),
    ]);

  type UserRow = {
    email: string;
    display_name: string | null;
    phone: string | null;
  } | null;

  type ItemRow = {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    unit_sale_price?: number | null;
    product_name?: string | null;
    product_image_url?: string | null;
    line_subtotal?: number | null;
    created_at: string | null;
  };

  type PaymentRow = {
    id: string;
    provider: string;
    method: string;
    amount: number;
    currency: string;
    status: string;
    transaction_id: string | null;
    payment_key: string | null;
    approved_at: string | null;
    created_at: string | null;
  };

  const u = (userRow ?? null) as UserRow;
  const items = (itemsData ?? []) as ItemRow[];
  const payments = (paymentRows ?? []) as PaymentRow[];

  const orderItems: OrderDetailItem[] = items.map((row) => {
    const subtotal =
      row.line_subtotal != null
        ? Number(row.line_subtotal)
        : row.quantity * Number(row.unit_price);
    return {
      id: row.id,
      product_id: row.product_id,
      product_name: row.product_name ?? "",
      product_image_url: row.product_image_url ?? null,
      quantity: row.quantity,
      unit_price: Number(row.unit_price),
      sale_price:
        row.unit_sale_price != null ? Number(row.unit_sale_price) : null,
      discount_amount: null,
      subtotal,
      created_at: row.created_at,
    };
  });

  const orderPayments: OrderDetailPayment[] = payments.map((p) => ({
    id: p.id,
    provider: p.provider,
    method: p.method,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    transaction_id: p.transaction_id,
    payment_key: p.payment_key,
    approved_at: p.approved_at,
    created_at: p.created_at,
  }));

  return {
    id: o.id,
    user_id: o.user_id,
    user_email: u?.email ?? null,
    user_name: u?.display_name ?? null,
    user_phone: u?.phone ?? null,
    status: o.status,
    payment_status: o.payment_status,
    total_amount: Number(o.total_amount),
    product_total_amount:
      o.subtotal_amount != null ? Number(o.subtotal_amount) : null,
    delivery_fee: o.shipping_fee != null ? Number(o.shipping_fee) : null,
    discount_total:
      o.discount_amount != null ? Number(o.discount_amount) : null,
    toss_order_id: o.toss_order_id,
    created_at: o.created_at,
    updated_at: o.updated_at,
    receiver_name: o.shipping_name,
    receiver_phone: o.shipping_phone,
    receiver_zipcode: o.shipping_zip,
    receiver_address1: o.shipping_address_line1,
    receiver_address2: o.shipping_address_line2,
    items: orderItems,
    payments: orderPayments,
  };
}

// --- 상품 리스트·상세 ---

export interface ReviewListItem {
  id: string;
  user_id: string;
  user_email: string | null;
  product_id: string;
  product_name: string;
  rating: number;
  content: string | null;
  created_at: string | null;
}

export interface ReviewListFilters {
  rating?: string;
}

export async function getReviewsList(
  page: number,
  pageSize: number,
  filters?: ReviewListFilters
): Promise<{ data: ReviewListItem[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("reviews")
    .select("id, user_id, product_id, rating, content, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (filters?.rating) {
    const ratingNumber = Number(filters.rating);
    if (!Number.isNaN(ratingNumber)) {
      q = q.eq("rating", ratingNumber);
    }
  }

  const { data: rows, count, error } = await q.range(from, to);
  if (error) return { data: [], total: 0 };

  type ReviewRow = {
    id: string;
    user_id: string;
    product_id: string;
    rating: number;
    content: string | null;
    created_at: string | null;
  };
  const reviews = (rows ?? []) as ReviewRow[];
  const total = count ?? 0;
  if (!reviews.length) return { data: [], total };

  const userIds = [...new Set(reviews.map((r) => r.user_id))];
  const productIds = [...new Set(reviews.map((r) => r.product_id))];

  const [{ data: userRows }, { data: productRows }] = await Promise.all([
    supabase.from("users").select("id, email").in("id", userIds),
    supabase.from("products").select("id, name").in("id", productIds),
  ]);

  type UserRow = { id: string; email: string };
  type ProductRow = { id: string; name: string };

  const userEmailMap = new Map<string, string>();
  for (const u of (userRows ?? []) as UserRow[]) {
    userEmailMap.set(u.id, u.email);
  }

  const productNameMap = new Map<string, string>();
  for (const p of (productRows ?? []) as ProductRow[]) {
    productNameMap.set(p.id, p.name);
  }

  const data: ReviewListItem[] = reviews.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    user_email: userEmailMap.get(r.user_id) ?? null,
    product_id: r.product_id,
    product_name: productNameMap.get(r.product_id) ?? "",
    rating: r.rating,
    content: r.content,
    created_at: r.created_at,
  }));

  return { data, total };
}

export type ProductListStatusFilter =
  | "all"
  | "registered"
  | "hidden"
  | "sold_out";

export interface ProductsListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: ProductListStatusFilter;
  category?: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  status: string;
  categories: string[] | null;
  created_at: string | null;
}

export async function getProductsList(
  params: ProductsListParams
): Promise<{ data: ProductListItem[]; total: number }> {
  const {
    page,
    pageSize,
    search,
    sortBy = "created_at",
    sortOrder = "desc",
    status,
    category,
  } = params;
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("products")
    .select(
      "id, name, price, sale_price, image_url, status, categories, created_at",
      {
        count: "exact",
      }
    );

  if (search?.trim()) {
    q = q.ilike("name", `%${search.trim()}%`);
  }
  if (status && status !== "all") {
    q = q.eq("status", status);
  }
  if (category?.trim()) {
    q = q.contains("categories", [category.trim()]);
  }

  const orderCol =
    sortBy === "name" ? "name" : sortBy === "price" ? "price" : "created_at";
  q = q.order(orderCol, { ascending: sortOrder === "asc" });
  const { data: rows, count, error } = await q.range(from, to);

  if (error) return { data: [], total: 0 };
  const data = (rows ?? []) as ProductListItem[];
  return { data, total: count ?? 0 };
}

export interface ProductDetailReviewSummary {
  review_count: number;
  rating_average: number | null;
}

export interface ProductDetailReviewItem {
  id: string;
  user_id: string;
  rating: number;
  content: string | null;
  created_at: string | null;
}

export interface ProductDetailOrderItem {
  order_id: string;
  order_item_id: string;
  quantity: number;
  created_at: string | null;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  status: string;
  categories: string[] | null;
  rating_average: number | null;
  created_at: string | null;
  updated_at: string | null;
  review_count: number;
  rating_avg: number | null;
  sold_quantity: number;
  reviews: ProductDetailReviewItem[];
  order_items: ProductDetailOrderItem[];
}

export interface ReviewDetail {
  id: string;
  rating: number;
  content: string | null;
  created_at: string | null;
  user_id: string;
  user_email: string | null;
  user_display_name: string | null;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
}

export async function getProductDetail(
  productId: string
): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, description, price, sale_price, image_url, status, categories, rating_average, created_at, updated_at"
    )
    .eq("id", productId)
    .maybeSingle();

  if (error || !product) return null;
  type ProductRow = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    sale_price: number | null;
    image_url: string | null;
    status: string;
    categories: string[] | null;
    rating_average: number | null;
    created_at: string | null;
    updated_at: string | null;
  };
  const p = product as ProductRow;

  const [{ data: reviewRows }, { count: reviewCount }] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, user_id, rating, content, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId),
  ]);
  type ReviewRow = {
    id: string;
    user_id: string;
    rating: number;
    content: string | null;
    created_at: string | null;
  };
  const reviews = (reviewRows ?? []) as ReviewRow[];
  const totalReviewCount = reviewCount ?? 0;

  const { data: orderItemRows } = await supabase
    .from("order_items")
    .select("id, order_id, quantity, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50);
  type OiRow = {
    id: string;
    order_id: string;
    quantity: number;
    created_at: string | null;
  };
  const orderItems = (orderItemRows ?? []) as OiRow[];

  const review_count = totalReviewCount;
  const rating_avg = p.rating_average ?? null;
  const sold_quantity = orderItems.reduce((s, o) => s + o.quantity, 0);

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    sale_price: p.sale_price,
    image_url: p.image_url,
    status: p.status,
    categories: p.categories,
    rating_average: p.rating_average,
    created_at: p.created_at,
    updated_at: p.updated_at,
    review_count,
    rating_avg,
    sold_quantity,
    reviews: reviews.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      rating: r.rating,
      content: r.content,
      created_at: r.created_at,
    })),
    order_items: orderItems.map((oi) => ({
      order_id: oi.order_id,
      order_item_id: oi.id,
      quantity: oi.quantity,
      created_at: oi.created_at,
    })),
  };
}

export interface ReviewDetail {
  id: string;
  rating: number;
  content: string | null;
  created_at: string | null;
  user_id: string;
  user_email: string | null;
  user_display_name: string | null;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
}

export async function getReviewDetail(
  reviewId: string
): Promise<ReviewDetail | null> {
  const supabase = await createClient();

  const { data: reviewRow, error } = await supabase
    .from("reviews")
    .select("id, user_id, product_id, rating, content, created_at")
    .eq("id", reviewId)
    .maybeSingle();

  if (error || !reviewRow) return null;

  type ReviewRow = {
    id: string;
    user_id: string;
    product_id: string;
    rating: number;
    content: string | null;
    created_at: string | null;
  };
  const r = reviewRow as ReviewRow;

  const [{ data: userRow }, { data: productRow }] = await Promise.all([
    supabase
      .from("users")
      .select("email, display_name")
      .eq("id", r.user_id)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id, name, image_url")
      .eq("id", r.product_id)
      .maybeSingle(),
  ]);

  type UserRow = {
    email: string;
    display_name: string | null;
  } | null;
  type ProductRow = {
    id: string;
    name: string;
    image_url: string | null;
  } | null;

  const u = (userRow ?? null) as UserRow;
  const p = (productRow ?? null) as ProductRow;

  return {
    id: r.id,
    rating: r.rating,
    content: r.content,
    created_at: r.created_at,
    user_id: r.user_id,
    user_email: u?.email ?? null,
    user_display_name: u?.display_name ?? null,
    product_id: p?.id ?? r.product_id,
    product_name: p?.name ?? "",
    product_image_url: p?.image_url ?? null,
  };
}
