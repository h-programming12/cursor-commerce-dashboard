"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { formatPrice } from "@/commons/utils/formatPrice";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { FOCUS_RING_COMMERCE } from "@/commons/styles/tailwind-patterns";
import { OrderStatusBadge } from "@/components/commerce/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/commerce/PaymentStatusBadge";
import type {
  OrderDetail,
  OrderDetailItem,
  OrderDetailPayment,
} from "@/app/(commerce)/account/orders/[orderId]/queries";

const BORDER_COLOR = commerceColors.neutral["03"]["100"];

const SECTION_CARD_STYLE: CSSProperties = {
  borderColor: BORDER_COLOR,
  backgroundColor: commerceColors.background.paper,
};

const SECTION_TITLE_STYLE: CSSProperties = {
  fontSize: commerceTypography.headline.h7.fontSize,
  lineHeight: "32px",
  fontFamily: commerceTypography.headline.h7.fontFamily,
  fontWeight: 600,
  color: commerceColors.text.primary,
};

const LABEL_STYLE: CSSProperties = {
  fontSize: commerceTypography.caption["1"].fontSize,
  lineHeight: 1.5,
  fontFamily: commerceTypography.caption["1"].fontFamily,
  color: commerceColors.text.tertiary,
};

const VALUE_STYLE: CSSProperties = {
  fontSize: commerceTypography.caption["1"].fontSize,
  lineHeight: 1.5,
  fontFamily: commerceTypography.caption["1"].fontFamily,
  fontWeight: 600,
  color: commerceColors.text.primary,
};

const NEUTRAL_VALUE_STYLE: CSSProperties = {
  ...VALUE_STYLE,
  fontWeight: 400,
  color: commerceColors.neutral["07"]["100"],
};

const BREADCRUMB_CAPTION_STYLE: CSSProperties = {
  ...LABEL_STYLE,
  fontWeight: 400,
};

const PRODUCTS_TABLE_HEAD_CELL_STYLE: CSSProperties = {
  fontSize: commerceTypography.caption["1"].fontSize,
  lineHeight: "22px",
  fontFamily: commerceTypography.caption["1"].fontFamily,
  fontWeight: 400,
  color: commerceColors.text.tertiary,
};

const NO_IMAGE_PLACEHOLDER_STYLE: CSSProperties = {
  fontSize: commerceTypography.caption["2"].fontSize,
  color: commerceColors.text.tertiary,
};

export interface OrderDetailSectionProps {
  order: OrderDetail;
}

function formatOrderDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderDetailBreadcrumb({ orderId }: { orderId: string }) {
  const linkStyle: CSSProperties = {
    ...BREADCRUMB_CAPTION_STYLE,
    color: commerceColors.text.secondary,
    textDecoration: "none",
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol
        className="flex flex-wrap items-center gap-1"
        style={BREADCRUMB_CAPTION_STYLE}
      >
        <li>
          <Link
            href={ACCOUNT_URLS.ACCOUNT}
            style={linkStyle}
            className={cn("hover:underline", FOCUS_RING_COMMERCE)}
          >
            My Account
          </Link>
        </li>
        <li aria-hidden="true"> / </li>
        <li>
          <Link
            href={ACCOUNT_URLS.ORDERS}
            style={linkStyle}
            className={cn("hover:underline", FOCUS_RING_COMMERCE)}
          >
            Orders
          </Link>
        </li>
        <li aria-hidden="true"> / </li>
        <li style={{ color: commerceColors.text.primary }}>
          #{orderId.slice(0, 8)}
        </li>
      </ol>
    </nav>
  );
}

function OrderDetailHeader({
  orderId,
  createdAt,
  status,
  paymentStatus,
}: {
  orderId: string;
  createdAt: string | null;
  status: string;
  paymentStatus: string;
}) {
  return (
    <section
      className="rounded-lg border p-6 mb-6"
      style={SECTION_CARD_STYLE}
      aria-labelledby="order-header-title"
    >
      <div className="flex flex-wrap items-center gap-4">
        <h2 id="order-header-title" style={SECTION_TITLE_STYLE}>
          Order #{orderId.slice(0, 8)}
        </h2>
        <span
          style={{
            fontSize: commerceTypography.caption["1"].fontSize,
            lineHeight: 1.5,
            color: commerceColors.text.tertiary,
          }}
        >
          {formatOrderDate(createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={status} />
          <PaymentStatusBadge status={paymentStatus} />
        </div>
      </div>
    </section>
  );
}

function OrderDetailSummary({ order }: { order: OrderDetail }) {
  return (
    <section
      className="rounded-lg border p-6 mb-6"
      style={SECTION_CARD_STYLE}
      aria-labelledby="order-summary-title"
    >
      <h3 id="order-summary-title" className="mb-4" style={SECTION_TITLE_STYLE}>
        Order Summary
      </h3>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <span style={LABEL_STYLE}>Items total</span>
          <span style={VALUE_STYLE}>{formatPrice(order.subtotalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span style={LABEL_STYLE}>Shipping</span>
          <span style={VALUE_STYLE}>{formatPrice(order.shippingFee)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between">
            <span style={LABEL_STYLE}>Discount</span>
            <span style={VALUE_STYLE}>
              -{formatPrice(order.discountAmount)}
            </span>
          </div>
        )}
        <div
          className="flex justify-between pt-2 mt-2 border-t"
          style={{ borderColor: BORDER_COLOR }}
        >
          <span style={{ ...LABEL_STYLE, fontWeight: 600 }}>Total</span>
          <span style={VALUE_STYLE}>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </section>
  );
}

function OrderDetailProducts({ items }: { items: OrderDetailItem[] }) {
  return (
    <section
      className="rounded-lg border overflow-hidden mb-6"
      style={SECTION_CARD_STYLE}
      aria-labelledby="order-products-title"
    >
      <h3
        id="order-products-title"
        className="p-6 pb-0"
        style={SECTION_TITLE_STYLE}
      >
        Products in this order
      </h3>
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full border-collapse" role="table">
          <thead>
            <tr className="border-b" style={{ borderColor: BORDER_COLOR }}>
              <th
                className="text-left py-3 px-6"
                style={{ ...PRODUCTS_TABLE_HEAD_CELL_STYLE, width: "40%" }}
              >
                Product
              </th>
              <th
                className="text-left py-3 px-6"
                style={{ ...PRODUCTS_TABLE_HEAD_CELL_STYLE, width: "15%" }}
              >
                Price
              </th>
              <th
                className="text-left py-3 px-6"
                style={{ ...PRODUCTS_TABLE_HEAD_CELL_STYLE, width: "15%" }}
              >
                Qty
              </th>
              <th
                className="text-left py-3 px-6"
                style={PRODUCTS_TABLE_HEAD_CELL_STYLE}
              >
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b align-middle"
                style={{ borderColor: BORDER_COLOR }}
              >
                <td className="py-4 px-6" style={NEUTRAL_VALUE_STYLE}>
                  <div className="flex items-center gap-3">
                    <Link
                      href={COMMERCE_URLS.PRODUCT_DETAIL(item.productId)}
                      className={cn(
                        "flex items-center gap-3 hover:opacity-80",
                        FOCUS_RING_COMMERCE
                      )}
                    >
                      <div
                        className="relative shrink-0 rounded overflow-hidden bg-(--commerce-background-light)"
                        style={{ width: 56, height: 56 }}
                      >
                        {item.productImageUrl ? (
                          <Image
                            src={item.productImageUrl}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={NO_IMAGE_PLACEHOLDER_STYLE}
                          >
                            No image
                          </div>
                        )}
                      </div>
                      <span>{item.productName || "—"}</span>
                    </Link>
                  </div>
                </td>
                <td className="py-4 px-6" style={NEUTRAL_VALUE_STYLE}>
                  {formatPrice(item.unitPrice)}
                </td>
                <td className="py-4 px-6" style={NEUTRAL_VALUE_STYLE}>
                  {item.quantity}
                </td>
                <td className="py-4 px-6" style={NEUTRAL_VALUE_STYLE}>
                  {formatPrice(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden flex flex-col list-none p-0 m-0" role="list">
        {items.map((item) => (
          <li
            key={item.id}
            className="px-4 py-4 first:pt-2 border-b last:border-b-0"
            style={{ borderColor: BORDER_COLOR }}
          >
            <Link
              href={COMMERCE_URLS.PRODUCT_DETAIL(item.productId)}
              className={cn(
                "flex gap-3 min-w-0 hover:opacity-80 rounded-md",
                FOCUS_RING_COMMERCE
              )}
            >
              <div className="relative w-16 h-20 shrink-0 rounded overflow-hidden bg-(--commerce-background-light)">
                {item.productImageUrl ? (
                  <Image
                    src={item.productImageUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={NO_IMAGE_PLACEHOLDER_STYLE}
                  >
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="wrap-break-word" style={NEUTRAL_VALUE_STYLE}>
                  {item.productName || "—"}
                </span>
                <span style={PRODUCTS_TABLE_HEAD_CELL_STYLE}>
                  Price: {formatPrice(item.unitPrice)}
                </span>
                <span style={PRODUCTS_TABLE_HEAD_CELL_STYLE}>
                  Qty: {item.quantity}
                </span>
                <span style={{ ...NEUTRAL_VALUE_STYLE, fontWeight: 600 }}>
                  Subtotal: {formatPrice(item.lineTotal)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function OrderDetailShipping({ order }: { order: OrderDetail }) {
  const hasShipping =
    order.shippingName ||
    order.shippingPhone ||
    order.shippingAddressLine1 ||
    order.shippingCity ||
    order.shippingZip ||
    order.shippingCountry;

  return (
    <section
      className="rounded-lg border p-6 mb-6"
      style={SECTION_CARD_STYLE}
      aria-labelledby="order-shipping-title"
    >
      <h3
        id="order-shipping-title"
        className="mb-4"
        style={SECTION_TITLE_STYLE}
      >
        Shipping Information
      </h3>
      {hasShipping ? (
        <div className="flex flex-col gap-2">
          {order.shippingName && (
            <div>
              <span style={LABEL_STYLE}>Name: </span>
              <span style={NEUTRAL_VALUE_STYLE}>{order.shippingName}</span>
            </div>
          )}
          {order.shippingPhone && (
            <div>
              <span style={LABEL_STYLE}>Phone: </span>
              <span style={NEUTRAL_VALUE_STYLE}>{order.shippingPhone}</span>
            </div>
          )}
          {(order.shippingAddressLine1 ||
            order.shippingCity ||
            order.shippingZip ||
            order.shippingCountry) && (
            <div>
              <span style={LABEL_STYLE}>Address: </span>
              <span style={NEUTRAL_VALUE_STYLE}>
                {[
                  order.shippingAddressLine1,
                  order.shippingAddressLine2,
                  [order.shippingCity, order.shippingState, order.shippingZip]
                    .filter(Boolean)
                    .join(" "),
                  order.shippingCountry,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p
          style={{
            ...NEUTRAL_VALUE_STYLE,
            color: commerceColors.text.tertiary,
          }}
        >
          No shipping information available.
        </p>
      )}
    </section>
  );
}

function OrderDetailPayment({
  payment,
}: {
  payment: OrderDetailPayment | null;
}) {
  return (
    <section
      className="rounded-lg border p-6"
      style={SECTION_CARD_STYLE}
      aria-labelledby="order-payment-title"
    >
      <h3 id="order-payment-title" className="mb-4" style={SECTION_TITLE_STYLE}>
        Payment Information
      </h3>
      {payment ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span style={LABEL_STYLE}>Status: </span>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <div>
            <span style={LABEL_STYLE}>Method: </span>
            <span style={NEUTRAL_VALUE_STYLE}>
              {payment.provider} / {payment.method}
            </span>
          </div>
          <div>
            <span style={LABEL_STYLE}>Amount: </span>
            <span style={NEUTRAL_VALUE_STYLE}>
              {formatPrice(payment.amount)} ({payment.currency})
            </span>
          </div>
          {payment.transactionId && (
            <div>
              <span style={LABEL_STYLE}>Transaction ID: </span>
              <span style={NEUTRAL_VALUE_STYLE}>{payment.transactionId}</span>
            </div>
          )}
          {payment.approvedAt && (
            <div>
              <span style={LABEL_STYLE}>Approved: </span>
              <span style={NEUTRAL_VALUE_STYLE}>
                {formatDateTime(payment.approvedAt)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p
          style={{
            ...NEUTRAL_VALUE_STYLE,
            color: commerceColors.text.tertiary,
          }}
        >
          No payment information available.
        </p>
      )}
    </section>
  );
}

export function OrderDetailSection({ order }: OrderDetailSectionProps) {
  return (
    <div className="flex flex-col">
      <OrderDetailBreadcrumb orderId={order.id} />
      <OrderDetailHeader
        orderId={order.id}
        createdAt={order.createdAt}
        status={order.status}
        paymentStatus={order.paymentStatus}
      />
      <OrderDetailSummary order={order} />
      <OrderDetailProducts items={order.items} />
      <OrderDetailShipping order={order} />
      <OrderDetailPayment payment={order.payment} />
    </div>
  );
}
