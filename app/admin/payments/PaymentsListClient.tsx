"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { PaymentListItem } from "@/app/admin/queries";
import { getAdminPaymentDetailUrl } from "@/commons/constants/url";

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

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "pending", label: "대기" },
  { value: "succeeded", label: "성공" },
  { value: "failed", label: "실패" },
  { value: "cancelled", label: "취소" },
];

interface PaymentsListClientProps {
  initialData: PaymentListItem[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialStatus: string;
}

export function PaymentsListClient({
  initialData,
  initialTotal,
  initialPage,
  initialPageSize,
  initialStatus,
}: PaymentsListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(initialTotal / initialPageSize));

  function setStatus(status: string) {
    const u = new URLSearchParams();
    if (status) u.set("status", status);
    u.set("page", "1");
    router.push(`${pathname}?${u.toString()}`);
  }

  function setPage(page: number) {
    const u = new URLSearchParams();
    if (initialStatus) u.set("status", initialStatus);
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
          결제 리스트
        </h1>
        <select
          value={initialStatus}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2"
          style={{
            borderColor: "var(--admin-border-card)",
            backgroundColor: "var(--admin-background-default)",
            fontFamily: "var(--admin-font-public-sans)",
            fontSize: "var(--admin-text-sm)",
            color: "var(--admin-text-primary)",
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {initialData.length === 0 ? (
        <div className="p-5">
          <p style={{ ...tdStyle, color: "var(--admin-text-tertiary)" }}>
            결제 내역이 없습니다.
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
                  결제 ID
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  주문 ID
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  이메일
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  상태
                </th>
                <th className="px-5 text-right" style={thStyle}>
                  금액
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  결제일
                </th>
              </tr>
            </thead>
            <tbody>
              {initialData.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(getAdminPaymentDetailUrl(row.id))}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    router.push(getAdminPaymentDetailUrl(row.id))
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
                      href={getAdminPaymentDetailUrl(row.id)}
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
                    style={{ color: "var(--admin-text-secondary)", ...tdStyle }}
                  >
                    {row.order_id.slice(0, 8)}…
                  </td>
                  <td
                    className="px-5"
                    style={{ color: "var(--admin-text-primary)", ...tdStyle }}
                  >
                    {row.user_email ?? "-"}
                  </td>
                  <td
                    className="px-5"
                    style={{ color: "var(--admin-text-secondary)", ...tdStyle }}
                  >
                    {row.status}
                  </td>
                  <td
                    className="px-5 text-right"
                    style={{ color: "var(--admin-text-primary)", ...tdStyle }}
                  >
                    {formatAmount(row.amount)}
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
