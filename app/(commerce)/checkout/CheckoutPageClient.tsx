"use client";

import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import type { OrderSummaryLineItem } from "@/components/commerce/OrderSummary";
import type {
  CheckoutFormDefaultUser,
  CheckoutFormValues,
} from "@/components/commerce/CheckoutForm";

export interface CheckoutPageClientProps {
  defaultUser: CheckoutFormDefaultUser;
  lineItems: OrderSummaryLineItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  serverSubtotal: number;
  serverShippingFee: number;
  serverDiscount: number;
  serverTotal: number;
}

export function CheckoutPageClient({
  defaultUser,
  lineItems,
  subtotal,
  shippingFee,
  discount,
  total,
  serverSubtotal,
  serverShippingFee,
  serverDiscount,
  serverTotal,
}: CheckoutPageClientProps) {
  const tossClientKey =
    typeof process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY === "string"
      ? process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      : undefined;

  const onSubmit = async (
    values: CheckoutFormValues
  ): Promise<{ orderId: string; tossOrderId: string } | void> => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactFirstName: values.contactFirstName,
        contactLastName: values.contactLastName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        shippingAddressLine1: values.shippingAddressLine1,
        shippingCountry: values.shippingCountry,
        shippingCity: values.shippingCity,
        shippingState: values.shippingState,
        shippingZip: values.shippingZip,
        clientSubtotal: Math.round(subtotal),
        clientShippingFee: shippingFee,
        clientDiscount: discount,
        clientTotal: total,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data.error as string) ?? "주문 생성에 실패했습니다.");
    }

    const data = (await res.json()) as {
      orderId?: string;
      tossOrderId?: string;
    };
    if (data.orderId && data.tossOrderId) {
      return { orderId: data.orderId, tossOrderId: data.tossOrderId };
    }
  };

  return (
    <CheckoutForm
      defaultUser={defaultUser}
      lineItems={lineItems}
      subtotal={subtotal}
      shippingFee={shippingFee}
      discount={discount}
      total={total}
      serverSubtotal={serverSubtotal}
      serverShippingFee={serverShippingFee}
      serverDiscount={serverDiscount}
      serverTotal={serverTotal}
      onSubmit={onSubmit}
      tossClientKey={tossClientKey}
    />
  );
}
