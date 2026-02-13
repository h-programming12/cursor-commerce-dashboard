import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { orderId?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const tossOrderId = body.orderId;
  if (!tossOrderId || typeof tossOrderId !== "string") {
    return NextResponse.json({
      success: true,
      message: "orderId가 없어 상태를 갱신하지 않았습니다. (결제 취소 시 흔함)",
    });
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, payment_status")
    .eq("toss_order_id", tossOrderId)
    .single();

  if (orderError || !orderRow) {
    return NextResponse.json(
      { error: "주문을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const order = orderRow as {
    id: string;
    user_id: string;
    payment_status: string;
  };

  if (order.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.payment_status === "failed") {
    return NextResponse.json({
      success: true,
      alreadyFailed: true,
      orderId: order.id,
    });
  }

  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({ status: "failed" } as never)
    .eq("order_id", order.id)
    .eq("user_id", session.user.id);

  if (updatePaymentError) {
    return NextResponse.json(
      { error: "결제 상태 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({ payment_status: "failed" } as never)
    .eq("id", order.id);

  if (updateOrderError) {
    return NextResponse.json(
      { error: "주문 상태 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
  });
}
