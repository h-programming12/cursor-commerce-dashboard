"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type {
  ProductListItem,
  ProductListStatusFilter,
} from "@/app/admin/queries";
import { getAdminProductDetailUrl } from "@/commons/constants/url";
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

function statusLabel(s: string): string {
  if (s === "registered") return "판매중";
  if (s === "hidden") return "숨김";
  if (s === "sold_out") return "품절";
  return s;
}

const STATUS_OPTIONS: { value: ProductListStatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "registered", label: "판매중" },
  { value: "hidden", label: "숨김" },
  { value: "sold_out", label: "품절" },
];

interface ProductsListClientProps {
  initialData: ProductListItem[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialSearch: string;
  initialSortBy: string;
  initialSortOrder: string;
  initialStatus: ProductListStatusFilter;
  initialCategory: string;
}

export function ProductsListClient({
  initialData,
  initialTotal,
  initialPage,
  initialPageSize,
  initialSearch,
  initialSortBy,
  initialSortOrder,
  initialStatus,
  initialCategory,
}: ProductsListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const totalPages = Math.max(1, Math.ceil(initialTotal / initialPageSize));

  function buildParams(updates: Record<string, string>) {
    const u = new URLSearchParams();
    u.set("page", String(updates.page ?? initialPage));
    if (updates.search !== undefined) {
      if (updates.search) u.set("search", updates.search);
    } else if (initialSearch) u.set("search", initialSearch);
    if (updates.sortBy !== undefined) u.set("sortBy", updates.sortBy);
    else if (initialSortBy !== "created_at") u.set("sortBy", initialSortBy);
    if (updates.sortOrder !== undefined) u.set("sortOrder", updates.sortOrder);
    else if (initialSortOrder !== "desc") u.set("sortOrder", initialSortOrder);
    if (updates.status !== undefined) {
      if (updates.status !== "all") u.set("status", updates.status);
    } else if (initialStatus !== "all") u.set("status", initialStatus);
    if (updates.category !== undefined) {
      if (updates.category) u.set("category", updates.category);
    } else if (initialCategory) u.set("category", initialCategory);
    return u;
  }

  function setPage(page: number) {
    const u = buildParams({ page: String(page) });
    router.push(`${pathname}?${u.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = buildParams({ page: "1", search: searchInput.trim() });
    router.push(`${pathname}?${u.toString()}`);
  }

  function setSort(sortBy: string, sortOrder: string) {
    const u = buildParams({ page: "1", sortBy, sortOrder });
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
          상품 리스트
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="검색..."
              className="rounded border px-3 py-1.5 w-48 focus-visible:outline-none focus-visible:ring-2"
              style={{
                borderColor: "var(--admin-border-card)",
                backgroundColor: "var(--admin-background-default)",
                fontFamily: "var(--admin-font-public-sans)",
                fontSize: "var(--admin-text-sm)",
                color: "var(--admin-text-primary)",
              }}
              aria-label="상품명 검색"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded focus-visible:outline-none focus-visible:ring-2"
              style={{
                backgroundColor: "var(--admin-primary-main)",
                color: "var(--admin-text-inverse)",
                fontFamily: "var(--admin-font-public-sans)",
                fontSize: "var(--admin-text-sm)",
              }}
            >
              검색
            </button>
          </form>
          <select
            value={`${initialSortBy}:${initialSortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split(":");
              setSort(sortBy, sortOrder);
            }}
            className="rounded border px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2"
            style={{
              borderColor: "var(--admin-border-card)",
              backgroundColor: "var(--admin-background-default)",
              fontFamily: "var(--admin-font-public-sans)",
              fontSize: "var(--admin-text-sm)",
              color: "var(--admin-text-primary)",
            }}
            aria-label="정렬"
          >
            <option value="created_at:desc">최신순</option>
            <option value="created_at:asc">오래된순</option>
            <option value="name:asc">이름 가나다순</option>
            <option value="name:desc">이름 가나다역순</option>
            <option value="price:asc">가격 낮은순</option>
            <option value="price:desc">가격 높은순</option>
          </select>
          <StatusFilter
            options={STATUS_OPTIONS}
            value={initialStatus}
            paramName="status"
          />
        </div>
      </div>
      {initialData.length === 0 ? (
        <div className="p-5">
          <p style={{ ...tdStyle, color: "var(--admin-text-tertiary)" }}>
            상품이 없습니다.
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
                  상품 ID
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  이름
                </th>
                <th className="px-5 text-right" style={thStyle}>
                  가격
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  상태
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  카테고리
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  등록일
                </th>
              </tr>
            </thead>
            <tbody>
              {initialData.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(getAdminProductDetailUrl(row.id))}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    router.push(getAdminProductDetailUrl(row.id))
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
                      href={getAdminProductDetailUrl(row.id)}
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
                    {row.name}
                  </td>
                  <td
                    className="px-5 text-right"
                    style={{ color: "var(--admin-text-primary)", ...tdStyle }}
                  >
                    {formatPrice(Number(row.sale_price ?? row.price))}
                  </td>
                  <td
                    className="px-5"
                    style={{
                      ...tdStyle,
                      color:
                        row.status === "registered"
                          ? "var(--admin-semantic-success)"
                          : row.status === "sold_out"
                          ? "var(--admin-semantic-error)"
                          : "var(--admin-text-secondary)",
                    }}
                  >
                    {statusLabel(row.status)}
                  </td>
                  <td
                    className="px-5"
                    style={{
                      ...tdStyle,
                      color: "var(--admin-text-secondary)",
                      fontSize: "var(--admin-text-sm)",
                    }}
                  >
                    {row.categories?.[0] ?? "-"}
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
