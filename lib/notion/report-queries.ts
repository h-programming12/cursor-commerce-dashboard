import { getSupabaseServiceClient } from "@/lib/supabase/service";

export interface DailySaleRow {
  date: string;
  orders: number;
  revenue: number;
}

export interface ProductSaleRow {
  productName: string;
  quantity: number;
  revenue: number;
}

export interface PaymentMethodStat {
  count: number;
  revenue: number;
}

export interface MonthlyReportData {
  totalOrders: number;
  totalRevenue: number;
  avgOrderAmount: number;
  dailySales: DailySaleRow[];
  productSales: ProductSaleRow[];
  paymentMethods: Record<string, PaymentMethodStat>;
  orderStatuses: Record<string, number>;
}

export interface OrderReportLineItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderReportPayment {
  method: string;
  amount: number;
  status: string;
  approvedAt: string | null;
}

export interface OrderReportData {
  orderId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  items: OrderReportLineItem[];
  payments: OrderReportPayment[];
  receiverName: string | null;
  receiverPhone: string | null;
  receiverZipcode: string | null;
  receiverAddress1: string | null;
  receiverAddress2: string | null;
}

function emptyMonthlyReport(): MonthlyReportData {
  return {
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderAmount: 0,
    dailySales: [],
    productSales: [],
    paymentMethods: {},
    orderStatuses: {},
  };
}

type OrderRowLite = {
  id: string;
  created_at: string | null;
  status: string;
  total_amount: number;
};

type OrderItemRowLite = {
  order_id: string;
  product_name: string | null;
  quantity: number;
  unit_price: number;
  line_subtotal: number | null;
};

type PaymentRowLite = {
  order_id: string;
  method: string;
  amount: number;
  status: string;
  created_at: string | null;
};

export async function getMonthlyReportData(
  startDate: string,
  endDate: string
): Promise<MonthlyReportData> {
  const empty = emptyMonthlyReport();
  const supabase = getSupabaseServiceClient();

  const { data: ordersRaw, error: ordersError } = await supabase
    .from("orders")
    .select("id, created_at, status, total_amount")
    .gte("created_at", `${startDate}T00:00:00`)
    .lte("created_at", `${endDate}T23:59:59`);

  if (ordersError || !ordersRaw?.length) {
    return empty;
  }

  const orders = ordersRaw as OrderRowLite[];
  const orderIds = orders.map((o) => o.id);

  const [{ data: itemsRaw }, { data: paymentsRaw }] = await Promise.all([
    supabase
      .from("order_items")
      .select("order_id, product_name, quantity, unit_price, line_subtotal")
      .in("order_id", orderIds),
    supabase
      .from("payments")
      .select("order_id, method, amount, status, created_at")
      .in("order_id", orderIds)
      .order("created_at", { ascending: true }),
  ]);

  const items = (itemsRaw ?? []) as OrderItemRowLite[];
  const payments = (paymentsRaw ?? []) as PaymentRowLite[];

  const totalOrders = orders.length;
  let totalRevenue = 0;
  const orderStatuses: Record<string, number> = {};
  const dailyMap = new Map<string, { orders: number; revenue: number }>();
  const productMap = new Map<string, { quantity: number; revenue: number }>();
  const firstPaymentByOrder = new Map<string, PaymentRowLite>();

  for (const p of payments) {
    if (!firstPaymentByOrder.has(p.order_id)) {
      firstPaymentByOrder.set(p.order_id, p);
    }
  }

  for (const o of orders) {
    const amt = Number(o.total_amount);
    totalRevenue += amt;
    orderStatuses[o.status] = (orderStatuses[o.status] ?? 0) + 1;
    const day =
      o.created_at !== null &&
      o.created_at !== undefined &&
      o.created_at.length >= 10
        ? o.created_at.slice(0, 10)
        : "";
    if (day) {
      const cur = dailyMap.get(day) ?? { orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += amt;
      dailyMap.set(day, cur);
    }
  }

  for (const it of items) {
    const name = (it.product_name?.trim() || "상품").slice(0, 500);
    const lineTotal =
      it.line_subtotal !== null && it.line_subtotal !== undefined
        ? Number(it.line_subtotal)
        : Number(it.quantity) * Number(it.unit_price);
    const cur = productMap.get(name) ?? { quantity: 0, revenue: 0 };
    cur.quantity += Number(it.quantity);
    cur.revenue += lineTotal;
    productMap.set(name, cur);
  }

  const paymentMethods: Record<string, PaymentMethodStat> = {};
  for (const o of orders) {
    const p = firstPaymentByOrder.get(o.id);
    if (!p) continue;
    const method = (p.method?.trim() || "unknown").slice(0, 100);
    const cur = paymentMethods[method] ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += Number(p.amount);
    paymentMethods[method] = cur;
  }

  const dailySales: DailySaleRow[] = [...dailyMap.entries()]
    .map(([date, v]) => ({
      date,
      orders: v.orders,
      revenue: v.revenue,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const productSales: ProductSaleRow[] = [...productMap.entries()]
    .map(([productName, v]) => ({
      productName,
      quantity: v.quantity,
      revenue: v.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalOrders,
    totalRevenue,
    avgOrderAmount:
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    dailySales,
    productSales,
    paymentMethods,
    orderStatuses,
  };
}

type OrderFullRow = {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_zip: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
};

type UserRowLite = {
  email: string;
  display_name: string | null;
};

type ItemDetailRow = {
  product_name: string | null;
  quantity: number;
  unit_price: number;
  line_subtotal: number | null;
};

type PaymentDetailRow = {
  method: string;
  amount: number;
  status: string;
  approved_at: string | null;
};

export async function getOrderReportData(
  orderId: string
): Promise<OrderReportData | null> {
  const supabase = getSupabaseServiceClient();

  const { data: orderRaw, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, payment_status, total_amount, created_at, contact_name, contact_phone, contact_email, shipping_name, shipping_phone, shipping_zip, shipping_address_line1, shipping_address_line2"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !orderRaw) {
    return null;
  }

  const o = orderRaw as OrderFullRow;

  const [{ data: userRaw }, { data: itemsRaw }, { data: paymentsRaw }] =
    await Promise.all([
      supabase
        .from("users")
        .select("email, display_name")
        .eq("id", o.user_id)
        .maybeSingle(),
      supabase
        .from("order_items")
        .select("product_name, quantity, unit_price, line_subtotal")
        .eq("order_id", orderId),
      supabase
        .from("payments")
        .select("method, amount, status, approved_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false }),
    ]);

  const u = (userRaw ?? null) as UserRowLite | null;
  const itemRows = (itemsRaw ?? []) as ItemDetailRow[];
  const paymentRows = (paymentsRaw ?? []) as PaymentDetailRow[];

  const items: OrderReportLineItem[] = itemRows.map((row) => {
    const lineTotal =
      row.line_subtotal !== null && row.line_subtotal !== undefined
        ? Number(row.line_subtotal)
        : Number(row.quantity) * Number(row.unit_price);
    return {
      productName: row.product_name?.trim() || "상품",
      quantity: Number(row.quantity),
      unitPrice: Number(row.unit_price),
      lineTotal,
    };
  });

  const payments: OrderReportPayment[] = paymentRows.map((p) => ({
    method: p.method,
    amount: Number(p.amount),
    status: p.status,
    approvedAt: p.approved_at,
  }));

  return {
    orderId: o.id,
    status: o.status,
    paymentStatus: o.payment_status,
    totalAmount: Number(o.total_amount),
    createdAt: o.created_at,
    customerName: u?.display_name ?? o.contact_name ?? null,
    customerEmail: u?.email ?? o.contact_email ?? null,
    customerPhone: o.contact_phone ?? null,
    items,
    payments,
    receiverName: o.shipping_name,
    receiverPhone: o.shipping_phone,
    receiverZipcode: o.shipping_zip,
    receiverAddress1: o.shipping_address_line1,
    receiverAddress2: o.shipping_address_line2,
  };
}
