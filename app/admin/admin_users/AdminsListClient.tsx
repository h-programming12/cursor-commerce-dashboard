"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { AdminListItem } from "@/app/admin/queries";
import { getAdminAdminDetailUrl } from "@/commons/constants/url";

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

interface AdminsListClientProps {
  initialData: AdminListItem[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
}

export function AdminsListClient({
  initialData,
  initialTotal,
  initialPage,
  initialPageSize,
}: AdminsListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(initialTotal / initialPageSize));

  function setPage(page: number) {
    const u = new URLSearchParams();
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
        className="px-5 py-4 border-b"
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
          관리자 리스트
        </h1>
      </div>
      {initialData.length === 0 ? (
        <div className="p-5">
          <p style={{ ...tdStyle, color: "var(--admin-text-tertiary)" }}>
            관리자가 없습니다.
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
                  onClick={() => router.push(getAdminAdminDetailUrl(row.id))}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    router.push(getAdminAdminDetailUrl(row.id))
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
                      href={getAdminAdminDetailUrl(row.id)}
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
