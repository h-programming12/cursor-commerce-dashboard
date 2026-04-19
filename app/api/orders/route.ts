/**
 * 주문 생성 API. 장바구니·서버 금액 검증 후 orders / payments / order_items를 트랜잭션에 가깝게 생성합니다.
 * E2E: `e2e/tests/api-order.spec.ts`, `e2e/tests/full-purchase-flow.spec.ts`
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE_AMOUNT = 2500;

function calcShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_AMOUNT;
}

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    contactFirstName: string;
    contactLastName: string;
    contactPhone: string;
    contactEmail: string;
    shippingAddressLine1: string;
    shippingCountry: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    clientSubtotal: number;
    clientShippingFee: number;
    clientDiscount: number;
    clientTotal: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: cartRows, error: cartError } = await supabase
    .from("cart_items")
    .select(
      `
      product_id,
      quantity,
      products (
        id,
        name,
        price,
        sale_price,
        image_url,
        status
      )
    `
    )
    .eq("user_id", userId);

  if (cartError) {
    return NextResponse.json({ error: "장바구니 조회 실패" }, { status: 500 });
  }

  const rawItems = (cartRows ?? []).filter((row: Record<string, unknown>) => {
    const products = row.products as Record<string, unknown> | null;
    return (products?.status as string) !== "hidden";
  });

  type ProductRow = {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    image_url: string | null;
  };

  const serverLineItems = rawItems.map((row: Record<string, unknown>) => {
    const product = row.products as ProductRow | null;
    const productId = (row.product_id as string) ?? product?.id ?? "";
    const price = Number(product?.price ?? 0);
    const salePrice =
      product?.sale_price !== null && product?.sale_price !== undefined
        ? Number(product.sale_price)
        : null;
    const unitPrice = salePrice ?? price;
    const quantity = Number(row.quantity ?? 1);
    const lineSubtotal = Math.round(unitPrice * quantity);
    return {
      productId,
      productName: (product?.name as string) ?? "",
      productImageUrl: (product?.image_url as string) ?? null,
      quantity,
      unitPrice,
      unitSalePrice: salePrice,
      lineSubtotal,
    };
  });

  const serverSubtotal = serverLineItems.reduce(
    (sum, i) => sum + i.lineSubtotal,
    0
  );
  const serverShippingFee = calcShippingFee(serverSubtotal);
  const serverDiscount = 0;
  const serverTotal = serverSubtotal + serverShippingFee - serverDiscount;

  if (
    Math.abs(body.clientSubtotal - serverSubtotal) > 1 ||
    body.clientShippingFee !== serverShippingFee ||
    Math.abs(body.clientTotal - serverTotal) > 1
  ) {
    return NextResponse.json(
      {
        error:
          "가격 정보가 일치하지 않습니다. 페이지를 새로고침 후 다시 시도해 주세요.",
      },
      { status: 400 }
    );
  }

  const contactName = [
    body.contactLastName.trim(),
    body.contactFirstName.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      total_amount: serverTotal,
      subtotal_amount: serverSubtotal,
      shipping_fee: serverShippingFee,
      discount_amount: serverDiscount,
      currency: "KRW",
      payment_status: "requested",
      contact_name: contactName || null,
      contact_phone: body.contactPhone?.trim() || null,
      contact_email: body.contactEmail?.trim() || null,
      shipping_name: contactName || null,
      shipping_phone: body.contactPhone?.trim() || null,
      shipping_address_line1: body.shippingAddressLine1?.trim() || null,
      shipping_address_line2: null,
      shipping_city: body.shippingCity?.trim() || null,
      shipping_state: body.shippingState?.trim() || null,
      shipping_zip: body.shippingZip?.trim() || null,
      shipping_country: body.shippingCountry?.trim() || null,
      toss_order_id: null,
    } as never)
    .select("id")
    .single();

  if (orderError || !orderData) {
    return NextResponse.json(
      { error: orderError?.message ?? "주문 생성 실패" },
      { status: 500 }
    );
  }

  const orderId = (orderData as { id: string }).id;
  const tossOrderId = orderId.replace(/-/g, "").slice(0, 64) || orderId;

  const { error: updateTossError } = await supabase
    .from("orders")
    .update({ toss_order_id: tossOrderId } as never)
    .eq("id", orderId);

  if (updateTossError) {
    await supabase.from("orders").delete().eq("id", orderId);
    return NextResponse.json(
      { error: updateTossError.message ?? "주문 정보 저장 실패" },
      { status: 500 }
    );
  }

  const { error: paymentInsertError } = await supabase.from("payments").insert({
    order_id: orderId,
    user_id: userId,
    provider: "tosspayments",
    method: "card",
    amount: serverTotal,
    currency: "KRW",
    status: "pending",
    transaction_id: null,
    payment_key: null,
    raw_payload: null,
    approved_at: null,
  } as never);

  if (paymentInsertError) {
    await supabase.from("orders").delete().eq("id", orderId);
    return NextResponse.json(
      { error: paymentInsertError.message ?? "결제 정보 생성 실패" },
      { status: 500 }
    );
  }

  const orderItemInserts = serverLineItems.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    unit_sale_price: item.unitSalePrice ?? null,
    product_name: item.productName,
    product_image_url: item.productImageUrl,
    line_subtotal: item.lineSubtotal,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemInserts as never);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderId);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  await supabase.from("cart_items").delete().eq("user_id", userId);

  return NextResponse.json({ orderId, tossOrderId });
}
