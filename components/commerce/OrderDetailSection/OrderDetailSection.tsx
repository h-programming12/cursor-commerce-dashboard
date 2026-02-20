"use client";

import Link from "next/link";
import Image from "next/image";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { formatPrice } from "@/commons/utils/formatPrice";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { OrderStatusBadge } from "@/components/commerce/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/commerce/PaymentStatusBadge";
import type {
  OrderDetail,
  OrderDetailItem,
  OrderDetailPayment,
} from "@/app/(commerce)/account/orders/[orderId]/queries";

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
  const captionStyle = {
    fontSize: commerceTypography.caption["1"].fontSize,
    lineHeight: 1.5,
    fontFamily: commerceTypography.caption["1"].fontFamily,
    fontWeight: 400,
    color: commerceColors.text.tertiary,
  };
  const linkStyle = {
    ...captionStyle,
    color: commerceColors.text.secondary,
    textDecoration: "none",
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1" style={captionStyle}>
        <li>
          <Link
            href={ACCOUNT_URLS.ACCOUNT}
            style={linkStyle}
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-primary-main)"
          >
            My Account
          </Link>
        </li>
        <li aria-hidden="true"> / </li>
        <li>
          <Link
            href={ACCOUNT_URLS.ORDERS}
            style={linkStyle}
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-primary-main)"
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
  const borderColor = commerceColors.neutral["03"]["100"];

  return (
    <section
      className="rounded-lg border p-6 mb-6"
      style={{
        borderColor,
        backgroundColor: commerceColors.background.paper,
      }}
      aria-labelledby="order-header-title"
    >
      <div className="flex flex-wrap items-center gap-4">
        <h2
          id="order-header-title"
          style={{
            fontSize: commerceTypography.headline.h7.fontSize,
            lineHeight: "32px",
            fontFamily: commerceTypography.headline.h7.fontFamily,
            fontWeight: 600,
            color: commerceColors.text.primary,
          }}
        >
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
  const borderColor = commerceColors.neutral["03"]["100"];
  const labelStyle = {
    fontSize: commerceTypography.caption["1"].fontSize,
    lineHeight: 1.5,
    fontFamily: commerceTypography.caption["1"].fontFamily,
    color: commerceColors.text.tertiary,
  };
  const valueStyle = {
    fontSize: commerceTypography.caption["1"].fontSize,
    lineHeight: 1.5,
    fontFamily: commerceTypography.caption["1"].fontFamily,
    fontWeight: 600,
    color: commerceColors.text.primary,
  };

  return (
    <section
      className="rounded-lg border p-6 mb-6"
      style={{
        borderColor,
        backgroundColor: commerceColors.background.paper,
      }}
      aria-labelledby="order-summary-title"
    >
      <h3
        id="order-summary-title"
        className="mb-4"
        style={{
          fontSize: commerceTypography.headline.h7.fontSize,
          lineHeight: "32px",
          fontFamily: commerceTypography.headline.h7.fontFamily,
          fontWeight: 600,
          color: commerceColors.text.primary,
        }}
      >
        Order Summary
      </h3>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <span style={labelStyle}>Items total</span>
          <span style={valueStyle}>{formatPrice(order.subtotalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span style={labelStyle}>Shipping</span>
          <span style={valueStyle}>{formatPrice(order.shippingFee)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between">
            <span style={labelStyle}>Discount</span>
            <span style={valueStyle}>-{formatPrice(order.discountAmount)}</span>
          </div>
        )}
        <div
          className="flex justify-between pt-2 mt-2 border-t"
          style={{ borderColor }}
        >
          <span style={{ ...labelStyle, fontWeight: 600 }}>Total</span>
          <span style={valueStyle}>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </section>
  );
}

function OrderDetailProducts({ items }: { items: OrderDetailItem[] }) {
  const borderColor = commerceColors.neutral["03"]["100"];
  const captionStyle = {
    fontSize: commerceTypography.caption["1"].fontSize,
    lineHeight: "22px",
    fontFamily: commerceTypography.caption["1"].fontFamily,
    fontWeight: 400,
    color: commerceColors.text.tertiary,
  };
  const cellStyle = {
    fontSize: commerceTypography.caption["1"].fontSize,
    lineHeight: 1.5,
    fontFamily: commerceTypography.caption["1"].fontFamily,
    color: commerceColors.neutral["07"]["100"],
  };

  return (
    <section
      className="rounded-lg border overflow-hidden mb-6"
      style={{
        borderColor,
        backgroundColor: commerceColors.background.paper,
      }}
      aria-labelledby="order-products-title"
    >
      <h3
        id="order-products-title"
        className="p-6 pb-0"
        style={{
          fontSize: commerceTypography.headline.h7.fontSize,
          lineHeight: "32px",
          fontFamily: commerceTypography.headline.h7.fontFamily,
          fontWeight: 600,
          color: commerceColors.text.primary,
        }}
      >
        Products in this order
      </h3>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse" role="table">
          <thead>
            <tr className="border-b" style={{ borderColor }}>
              <th
                className="text-left py-3 px-6"
                style={{ ...captionStyle, width: "40%" }}
              >
                Product
              </th>
              <th
                className="text-left py-3 px-6"
                style={{ ...captionStyle, width: "15%" }}
              >
                Price
              </th>
              <th
                className="text-left py-3 px-6"
                style={{ ...captionStyle, width: "15%" }}
              >
                Qty
              </th>
              <th className="text-left py-3 px-6" style={captionStyle}>
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b align-middle"
                style={{ borderColor }}
              >
                <td className="py-4 px-6" style={cellStyle}>
                  <div className="flex items-center gap-3">
                    <Link
                      href={COMMERCE_URLS.PRODUCT_DETAIL(item.productId)}
                      className="flex items-center gap-3 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-primary-main)"
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
                            style={{
                              fontSize:
                                commerceTypography.caption["2"].fontSize,
                              color: commerceColors.text.tertiary,
                            }}
                          >
                            No image
                          </div>
                        )}
                      </div>
                      <span>{item.productName || "—"}</span>
                    </Link>
                  </div>
                </td>
                <td className="py-4 px-6" style={cellStyle}>
                  {formatPrice(item.unitPrice)}
                </td>
                <td className="py-4 px-6" style={cellStyle}>
                  {item.quantity}
                </td>
                <td className="py-4 px-6" style={cellStyle}>
                  {formatPrice(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OrderDetailShipping({ order }: { order: OrderDetail }) {
  const borderColor = commerceColors.neutral["03"]["100"];
  const labelStyle = {
    fontSize: commerceTypography.caption["1"].fontSize,
    lineHeight: 1.5,
    fontFamily: commerceTypography.caption["1"].fontFamily,
    color: commerceColors.text.tertiary,
  };
  const valueStyle = {
    fontSize: commerceTypography.caption["1"].fontSize,
    lineHeight: 1.5,
    fontFamily: commerceTypography.caption["1"].fontFamily,
    color: commerceColors.neutral["07"]["100"],
  };

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
      style={{
        borderColor,
        backgroundColor: commerceColors.background.paper,
      }}
      aria-labelledby="order-shipping-title"
    >
      <h3
        id="order-shipping-title"
        className="mb-4"
        style={{
          fontSize: commerceTypography.headline.h7.fontSize,
          lineHeight: "32px",
          fontFamily: commerceTypography.headline.h7.fontFamily,
          fontWeight: 600,
          color: commerceColors.text.primary,
        }}
      >
        Shipping Information
      </h3>
      {hasShipping ? (
        <div className="flex flex-col gap-2">
          {order.shippingName && (
            <div>
              <span style={labelStyle}>Name: </span>
              <span style={valueStyle}>{order.shippingName}</span>
            </div>
          )}
          {order.shippingPhone && (
            <div>
              <span style={labelStyle}>Phone: </span>
              <span style={valueStyle}>{order.shippingPhone}</span>
            </div>
          )}
          {(order.shippingAddressLine1 ||
            order.shippingCity ||
            order.shippingZip ||
            order.shippingCountry) && (
            <div>
              <span style={labelStyle}>Address: </span>
              <span style={valueStyle}>
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
        <p style={{ ...valueStyle, color: commerceColors.text.tertiary }}>
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
  const borderColor = commerceColors.neutral["03"]["100"];
  const labelStyle = {
    fontSize: commerceTypography.caption["1"].fontSize,
    lineHeight: 1.5,
    fontFamily: commerceTypography.caption["1"].fontFamily,
    color: commerceColors.text.tertiary,
  };
  const valueStyle = {
    fontSize: commerceTypography.caption["1"].fontSize,
    lineHeight: 1.5,
    fontFamily: commerceTypography.caption["1"].fontFamily,
    color: commerceColors.neutral["07"]["100"],
  };

  return (
    <section
      className="rounded-lg border p-6"
      style={{
        borderColor,
        backgroundColor: commerceColors.background.paper,
      }}
      aria-labelledby="order-payment-title"
    >
      <h3
        id="order-payment-title"
        className="mb-4"
        style={{
          fontSize: commerceTypography.headline.h7.fontSize,
          lineHeight: "32px",
          fontFamily: commerceTypography.headline.h7.fontFamily,
          fontWeight: 600,
          color: commerceColors.text.primary,
        }}
      >
        Payment Information
      </h3>
      {payment ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span style={labelStyle}>Status: </span>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <div>
            <span style={labelStyle}>Method: </span>
            <span style={valueStyle}>
              {payment.provider} / {payment.method}
            </span>
          </div>
          <div>
            <span style={labelStyle}>Amount: </span>
            <span style={valueStyle}>
              {formatPrice(payment.amount)} ({payment.currency})
            </span>
          </div>
          {payment.transactionId && (
            <div>
              <span style={labelStyle}>Transaction ID: </span>
              <span style={valueStyle}>{payment.transactionId}</span>
            </div>
          )}
          {payment.approvedAt && (
            <div>
              <span style={labelStyle}>Approved: </span>
              <span style={valueStyle}>
                {formatDateTime(payment.approvedAt)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p style={{ ...valueStyle, color: commerceColors.text.tertiary }}>
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
