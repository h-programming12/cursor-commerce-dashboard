import { createClient } from "@/lib/supabase/server";

export interface OrderDetailItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetailPayment {
  id: string;
  provider: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string | null;
  approvedAt: string | null;
}

export interface OrderDetail {
  id: string;
  userId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  subtotalAmount: number;
  shippingFee: number;
  discountAmount: number;
  currency: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  createdAt: string | null;
  paidAt: string | null;
  items: OrderDetailItem[];
  payment: OrderDetailPayment | null;
}

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  subtotal_amount?: number;
  shipping_fee?: number;
  discount_amount?: number;
  currency?: string;
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
  paid_at: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name?: string | null;
  product_image_url?: string | null;
  line_subtotal?: number | null;
};

type PaymentRow = {
  id: string;
  provider: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string | null;
  approved_at: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  image_url: string | null;
};

export async function getOrderDetail(
  orderId: string,
  userId: string
): Promise<OrderDetail | null> {
  const supabase = await createClient();

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (orderError || !orderData) {
    return null;
  }

  const order = orderData as unknown as OrderRow;

  const { data: itemsData, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    return null;
  }

  const itemRows = (itemsData ?? []) as OrderItemRow[];
  const productIds = [...new Set(itemRows.map((r) => r.product_id))];

  let productMap: Record<string, ProductRow> = {};
  if (productIds.length > 0) {
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, image_url")
      .in("id", productIds);
    const products = (productsData ?? []) as ProductRow[];
    productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  }

  const items: OrderDetailItem[] = itemRows.map((row) => {
    const product = productMap[row.product_id];
    const productName = row.product_name ?? product?.name ?? "";
    const productImageUrl = row.product_image_url ?? product?.image_url ?? null;
    const lineTotal =
      row.line_subtotal !== null && row.line_subtotal !== undefined
        ? Number(row.line_subtotal)
        : row.quantity * row.unit_price;
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      productName,
      productImageUrl,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      lineTotal,
    };
  });

  const { data: paymentData } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const paymentRow = paymentData as PaymentRow | null;
  const payment: OrderDetailPayment | null = paymentRow
    ? {
        id: paymentRow.id,
        provider: paymentRow.provider,
        method: paymentRow.method,
        amount: paymentRow.amount,
        currency: paymentRow.currency,
        status: paymentRow.status,
        transactionId: paymentRow.transaction_id,
        approvedAt: paymentRow.approved_at,
      }
    : null;

  return {
    id: order.id,
    userId: order.user_id,
    status: order.status,
    paymentStatus: order.payment_status,
    totalAmount: order.total_amount,
    subtotalAmount: order.subtotal_amount ?? order.total_amount,
    shippingFee: order.shipping_fee ?? 0,
    discountAmount: order.discount_amount ?? 0,
    currency: order.currency ?? "KRW",
    contactName: order.contact_name,
    contactPhone: order.contact_phone,
    contactEmail: order.contact_email,
    shippingName: order.shipping_name,
    shippingPhone: order.shipping_phone,
    shippingAddressLine1: order.shipping_address_line1,
    shippingAddressLine2: order.shipping_address_line2,
    shippingCity: order.shipping_city,
    shippingState: order.shipping_state,
    shippingZip: order.shipping_zip,
    shippingCountry: order.shipping_country,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    items,
    payment,
  };
}
