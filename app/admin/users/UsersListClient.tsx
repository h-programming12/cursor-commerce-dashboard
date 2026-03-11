"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { UserListItem } from "@/app/admin/queries";
import type { UserListRoleFilter } from "@/app/admin/queries";
import { getAdminUserDetailUrl } from "@/commons/constants/url";
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

const ROLE_OPTIONS: { value: UserListRoleFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "user", label: "유저" },
  { value: "admin", label: "관리자" },
];

interface UsersListClientProps {
  initialData: UserListItem[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialRole: UserListRoleFilter;
}

export function UsersListClient({
  initialData,
  initialTotal,
  initialPage,
  initialPageSize,
  initialRole,
}: UsersListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(initialTotal / initialPageSize));

  function setPage(page: number) {
    const u = new URLSearchParams();
    u.set("role", initialRole);
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
          유저 리스트
        </h1>
        <StatusFilter
          options={ROLE_OPTIONS}
          value={initialRole}
          paramName="role"
        />
      </div>
      {initialData.length === 0 ? (
        <div className="p-5">
          <p style={{ ...tdStyle, color: "var(--admin-text-tertiary)" }}>
            유저가 없습니다.
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
                  이메일
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  이름
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  역할
                </th>
                <th className="px-5 text-right" style={thStyle}>
                  주문 수
                </th>
                <th className="px-5 text-right" style={thStyle}>
                  총 주문 금액
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  가입일
                </th>
              </tr>
            </thead>
            <tbody>
              {initialData.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(getAdminUserDetailUrl(row.id))}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    router.push(getAdminUserDetailUrl(row.id))
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
                      href={getAdminUserDetailUrl(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{
                        color: "var(--admin-semantic-info)",
                        ...tdStyle,
                      }}
                    >
                      {row.email}
                    </Link>
                  </td>
                  <td
                    className="px-5"
                    style={{ color: "var(--admin-text-primary)", ...tdStyle }}
                  >
                    {row.display_name ?? "-"}
                  </td>
                  <td
                    className="px-5"
                    style={{ color: "var(--admin-text-secondary)", ...tdStyle }}
                  >
                    {row.role}
                  </td>
                  <td
                    className="px-5 text-right"
                    style={{ color: "var(--admin-text-primary)", ...tdStyle }}
                  >
                    {row.order_count}
                  </td>
                  <td
                    className="px-5 text-right"
                    style={{ color: "var(--admin-text-primary)", ...tdStyle }}
                  >
                    {formatAmount(row.total_order_amount)}
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
            총 {initialTotal}명
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
