import path from "node:path";
import type { APIRequestContext } from "@playwright/test";
import type { CheckoutContactAndShipping } from "../pages/CheckoutPage";

export const SAMPLE_ORDER_SHIPPING: CheckoutContactAndShipping = {
  contactFirstName: "E2E",
  contactLastName: "APIOrder",
  contactPhone: "010-1234-5678",
  contactEmail: "e2e-api-order@example.com",
  shippingAddressLine1: "123 API Test Street",
  shippingCountry: "South Korea",
  shippingCity: "Seoul",
  shippingState: "Seoul",
  shippingZip: "04501",
};

export const FULL_FLOW_SHIPPING: CheckoutContactAndShipping = {
  contactFirstName: "E2E",
  contactLastName: "FullFlow",
  contactPhone: "010-9876-5432",
  contactEmail: "e2e-full-flow@example.com",
  shippingAddressLine1: "456 Flow Test Avenue",
  shippingCountry: "South Korea",
  shippingCity: "Seoul",
  shippingState: "Seoul",
  shippingZip: "04502",
};

export function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export const AUTH_STORAGE_STATE_PATH = path.join(
  process.cwd(),
  "e2e",
  ".auth",
  "user.json"
);

export interface CartItemJson {
  productId: string;
  totalPrice: number;
}

export interface CartGetJson {
  items: CartItemJson[];
}

export function sumCartSubtotal(items: CartItemJson[]): number {
  return items.reduce((sum, i) => sum + i.totalPrice, 0);
}

export function computeClientTotals(subtotal: number): {
  clientSubtotal: number;
  clientShippingFee: number;
  clientDiscount: number;
  clientTotal: number;
} {
  const shippingFee = subtotal >= 50000 ? 0 : 2500;
  const discount = 0;
  return {
    clientSubtotal: subtotal,
    clientShippingFee: shippingFee,
    clientDiscount: discount,
    clientTotal: subtotal + shippingFee - discount,
  };
}

export function buildOrderPostBody(
  shipping: CheckoutContactAndShipping,
  totals: ReturnType<typeof computeClientTotals>
): Record<string, string | number> {
  return {
    contactFirstName: shipping.contactFirstName,
    contactLastName: shipping.contactLastName,
    contactPhone: shipping.contactPhone,
    contactEmail: shipping.contactEmail,
    shippingAddressLine1: shipping.shippingAddressLine1,
    shippingCountry: shipping.shippingCountry,
    shippingCity: shipping.shippingCity,
    shippingState: shipping.shippingState,
    shippingZip: shipping.shippingZip,
    clientSubtotal: totals.clientSubtotal,
    clientShippingFee: totals.clientShippingFee,
    clientDiscount: totals.clientDiscount,
    clientTotal: totals.clientTotal,
  };
}

export async function clearCartViaApi(api: APIRequestContext): Promise<void> {
  const res = await api.get("/api/cart");
  if (!res.ok()) {
    throw new Error(`GET /api/cart 실패: ${res.status()}`);
  }
  const data = (await res.json()) as CartGetJson;
  for (const item of data.items) {
    const del = await api.delete(
      `/api/cart?productId=${encodeURIComponent(item.productId)}`
    );
    if (!del.ok()) {
      throw new Error(`DELETE /api/cart 실패: ${del.status()}`);
    }
  }
}

export async function fetchCartJson(
  api: APIRequestContext
): Promise<CartGetJson> {
  const res = await api.get("/api/cart");
  if (!res.ok()) {
    throw new Error(`GET /api/cart 실패: ${res.status()}`);
  }
  return res.json() as Promise<CartGetJson>;
}
