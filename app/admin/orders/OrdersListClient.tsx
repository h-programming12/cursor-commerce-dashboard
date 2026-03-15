"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { OrderListItem, OrderListStatusFilter } from "@/app/admin/queries";
import { getAdminOrderDetailUrl } from "@/commons/constants/url";
import { StatusFilter } from "@/components/admin/filter/StatusFilter";

const thStyle = {
  fontSize: "var(--admin-caption-2-semi-font-size)",
  lineHeight: 1.4,
  fontFamily: "var(--admin-font-inter)",
  fontWeight: "var(--admin-font-semibold)" as const,
  color: "var(--admin-text-tertiary)",
};

const tdStyle = {
  fontSize: "var(--admin-text-md)",
  lineHeight: 1.5,
  fontFamily: "var(--admin-font-public-sans)",
};

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

const ORDER_STATUS_OPTIONS: { value: OrderListStatusFilter; label: string }[] =
  [
    { value: "all", label: "전체" },
    { value: "pending", label: "대기" },
    { value: "paid", label: "결제완료" },
    { value: "canceled", label: "취소" },
    { value: "refunded", label: "환불" },
  ];

const ORDER_STATUS_COLOR: Record<
  "pending" | "paid" | "canceled" | "refunded",
  string
> = {
  pending: "var(--admin-text-secondary)",
  paid: "var(--admin-semantic-success)",
  canceled: "var(--admin-semantic-error)",
  refunded: "var(--admin-semantic-info)",
};

function OrderStatusBadge({ status }: { status: string }) {
  const color =
    ORDER_STATUS_COLOR[status as keyof typeof ORDER_STATUS_COLOR] ??
    "var(--admin-text-secondary)";
  return (
    <span
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        padding: "2px 8px",
        borderRadius: "4px",
        ...tdStyle,
      }}
    >
      {status}
    </span>
  );
}

interface OrdersListClientProps {
  initialData: OrderListItem[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialStatus: string;
}

function toStatusFilter(s: string): OrderListStatusFilter {
  if (s === "pending" || s === "paid" || s === "canceled" || s === "refunded")
    return s;
  return "all";
}

export function OrdersListClient({
  initialData,
  initialTotal,
  initialPage,
  initialPageSize,
  initialStatus,
}: OrdersListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(initialTotal / initialPageSize));

  const statusValue = toStatusFilter(initialStatus);

  function setPage(page: number) {
    const u = new URLSearchParams();
    if (statusValue !== "all") u.set("status", statusValue);
    u.set("page", String(page));
    router.push(`${pathname}?${u.toString()}`);
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: "var(--admin-background-default)",
        borderColor: "var(--admin-border-card)",
      }}
    >
      <div
        className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-4"
        style={{ borderColor: "var(--admin-neutral-03-100)" }}
      >
        <h1
          style={{
            fontSize: "var(--admin-headline-h7-font-size)",
            lineHeight: 1.2,
            fontFamily: "var(--admin-font-poppins)",
            fontWeight: "var(--admin-font-medium)",
            color: "var(--admin-text-primary)",
          }}
        >
          주문 리스트
        </h1>
        <StatusFilter
          options={ORDER_STATUS_OPTIONS}
          value={statusValue}
          paramName="status"
        />
      </div>
      {initialData.length === 0 ? (
        <div className="p-5">
          <p style={{ ...tdStyle, color: "var(--admin-text-tertiary)" }}>
            주문 내역이 없습니다.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--admin-background-light)",
                  height: "var(--admin-table-header-height)",
                }}
              >
                <th className="px-5 text-left" style={thStyle}>
                  주문 ID
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  고객 이메일
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  주문 상태
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  결제 상태
                </th>
                <th className="px-5 text-right" style={thStyle}>
                  주문 금액
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  주문일시
                </th>
              </tr>
            </thead>
            <tbody>
              {initialData.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(getAdminOrderDetailUrl(row.id))}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    router.push(getAdminOrderDetailUrl(row.id))
                  }
                  style={{
                    height: "var(--admin-table-row-height)",
                    borderTop: "1px solid var(--admin-border-table-cell)",
                    cursor: "pointer",
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <td className="px-5">
                    <Link
                      href={getAdminOrderDetailUrl(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{
                        color: "var(--admin-semantic-info)",
                        ...tdStyle,
                      }}
                    >
                      {row.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td
                    className="px-5"
                    style={{ color: "var(--admin-text-primary)", ...tdStyle }}
                  >
                    {row.user_email ?? "-"}
                  </td>
                  <td className="px-5" style={tdStyle}>
                    <OrderStatusBadge status={row.status} />
                  </td>
                  <td
                    className="px-5"
                    style={{ color: "var(--admin-text-secondary)", ...tdStyle }}
                  >
                    {row.payment_status}
                  </td>
                  <td
                    className="px-5 text-right"
                    style={{ color: "var(--admin-text-primary)", ...tdStyle }}
                  >
                    {formatAmount(row.total_amount)}
                  </td>
                  <td
                    className="px-5"
                    style={{
                      ...tdStyle,
                      color: "var(--admin-text-tertiary)",
                      fontSize: "var(--admin-text-sm)",
                    }}
                  >
                    {formatDate(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div
          className="px-5 py-4 border-t flex items-center justify-between"
          style={{ borderColor: "var(--admin-neutral-03-100)" }}
        >
          <span style={{ ...tdStyle, color: "var(--admin-text-tertiary)" }}>
            총 {initialTotal}건
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={initialPage <= 1}
              onClick={() => setPage(initialPage - 1)}
              className="px-3 py-1 rounded disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2"
              style={{ ...tdStyle, color: "var(--admin-text-primary)" }}
            >
              이전
            </button>
            <span style={{ ...tdStyle, color: "var(--admin-text-secondary)" }}>
              {initialPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={initialPage >= totalPages}
              onClick={() => setPage(initialPage + 1)}
              className="px-3 py-1 rounded disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2"
              style={{ ...tdStyle, color: "var(--admin-text-primary)" }}
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
