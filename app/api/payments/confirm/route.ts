/**
 * 토스 결제 승인 콜백 처리: 금액·주문 소유 검증 후 주문/결제 상태 갱신.
 */
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentSlackNotification } from "@/lib/slack/notify";
import type { Database, Json } from "@/types/supabase";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];

const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

function getTossAuthHeader(secretKey: string): string {
  const encoded = Buffer.from(`${secretKey}:`, "utf-8").toString("base64");
  return `Basic ${encoded}`;
}

export async function POST(request: NextRequest) {
  const supabase = (await createClient()) as SupabaseClient<Database>;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "TOSS_SECRET_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let body: { orderId: string; paymentKey: string; amount: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { orderId: orderIdFromClient, paymentKey, amount } = body;
  if (!orderIdFromClient || !paymentKey || typeof amount !== "number") {
    return NextResponse.json(
      { error: "orderId, paymentKey, amount가 필요합니다." },
      { status: 400 }
    );
  }

  const tossOrderIdNormalized = String(orderIdFromClient)
    .replace(/-/g, "")
    .trim()
    .toLowerCase();

  const byTossOrderId = await supabase
    .from("orders")
    .select("id, user_id, total_amount, status, payment_status")
    .eq("toss_order_id", tossOrderIdNormalized)
    .maybeSingle();

  let order: OrderRow | null = byTossOrderId.data as OrderRow | null;
  let orderError: Error | null = byTossOrderId.error ?? null;

  if (!order && !orderError) {
    const withHyphens =
      tossOrderIdNormalized.length === 32
        ? [
            tossOrderIdNormalized.slice(0, 8),
            tossOrderIdNormalized.slice(8, 12),
            tossOrderIdNormalized.slice(12, 16),
            tossOrderIdNormalized.slice(16, 20),
            tossOrderIdNormalized.slice(20, 32),
          ].join("-")
        : null;
    if (withHyphens) {
      const byId = await supabase
        .from("orders")
        .select("id, user_id, total_amount, status, payment_status")
        .eq("id", withHyphens)
        .maybeSingle();
      order = byId.data as OrderRow | null;
      if (byId.error) orderError = byId.error;
    }
  }

  if (orderError || !order) {
    return NextResponse.json(
      {
        error: "주문을 찾을 수 없습니다.",
        debug:
          process.env.NODE_ENV === "development"
            ? {
                receivedOrderId: orderIdFromClient,
                normalized: tossOrderIdNormalized,
              }
            : undefined,
      },
      { status: 404 }
    );
  }

  if (order.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status === "paid" && order.payment_status === "success") {
    return NextResponse.json({
      success: true,
      alreadyConfirmed: true,
      orderId: order.id,
    });
  }

  const orderTotal = Number(order.total_amount);
  if (Math.abs(orderTotal - amount) > 1) {
    return NextResponse.json(
      { error: "결제 금액이 주문 금액과 일치하지 않습니다." },
      { status: 400 }
    );
  }

  const confirmRes = await fetch(TOSS_CONFIRM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getTossAuthHeader(secretKey),
    },
    body: JSON.stringify({
      paymentKey,
      orderId: tossOrderIdNormalized,
      amount,
    }),
  });

  const tossData = await confirmRes.json().catch(() => ({}));

  if (!confirmRes.ok) {
    const paymentUpdateFail: PaymentUpdate = {
      status: "failed",
      raw_payload: tossData as Json,
    };
    const { error: updatePayError } = await supabase
      .from("payments")
      .update(paymentUpdateFail as never)
      .eq("order_id", order.id)
      .eq("user_id", session.user.id);

    if (updatePayError) {
      // 로깅만 하고 응답은 토스 오류 기준
    }
    const orderUpdateFail: OrderUpdate = { payment_status: "failed" };
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update(orderUpdateFail as never)
      .eq("id", order.id);

    if (updateOrderError) {
      // 로깅만
    }

    return NextResponse.json(
      {
        error: tossData?.message ?? "결제 승인에 실패했습니다.",
        code: tossData?.code,
      },
      { status: confirmRes.status >= 400 ? confirmRes.status : 400 }
    );
  }

  const approvedAt =
    typeof tossData.approvedAt === "string"
      ? tossData.approvedAt
      : new Date().toISOString();

  const paymentUpdateSuccess: PaymentUpdate = {
    status: "succeeded",
    payment_key: paymentKey,
    approved_at: approvedAt,
    raw_payload: tossData as Json,
  };
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update(paymentUpdateSuccess as never)
    .eq("order_id", order.id)
    .eq("user_id", session.user.id);

  if (updatePaymentError) {
    return NextResponse.json(
      { error: "결제 정보 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  const orderUpdateSuccess: OrderUpdate = {
    status: "paid",
    payment_status: "success",
    paid_at: approvedAt,
  };
  const { error: updateOrderError } = await supabase
    .from("orders")
    .update(orderUpdateSuccess as never)
    .eq("id", order.id);

  if (updateOrderError) {
    return NextResponse.json(
      { error: "주문 상태 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  void sendPaymentSlackNotification({
    orderId: order.id,
    amount,
    method: typeof tossData.method === "string" ? tossData.method : "UNKNOWN",
    userEmail: session.user.email ?? "unknown@example.com",
    approvedAt,
  });

  void import("@/lib/notion/create-report")
    .then(({ createOrderReport }) => createOrderReport(order.id))
    .catch((err) => console.error("[notion] 주문 리포트 생성 실패:", err));

  return NextResponse.json({
    success: true,
    orderId: order.id,
  });
}
