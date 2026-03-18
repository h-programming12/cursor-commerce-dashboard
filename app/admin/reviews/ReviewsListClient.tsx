"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { ReviewListItem } from "@/app/admin/queries";
import { getAdminReviewDetailUrl } from "@/commons/constants/url";
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

function renderStars(rating: number): string {
  const clamped = Math.max(1, Math.min(5, rating));
  return "★".repeat(clamped) + "☆".repeat(5 - clamped);
}

type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

const RATING_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "5", label: "★5" },
  { value: "4", label: "★4" },
  { value: "3", label: "★3" },
  { value: "2", label: "★2" },
  { value: "1", label: "★1" },
];

interface ReviewsListClientProps {
  initialData: ReviewListItem[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialRating: string;
}

function toRatingFilter(s: string): RatingFilter {
  if (s === "5" || s === "4" || s === "3" || s === "2" || s === "1") return s;
  return "all";
}

export function ReviewsListClient({
  initialData,
  initialTotal,
  initialPage,
  initialPageSize,
  initialRating,
}: ReviewsListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(initialTotal / initialPageSize));

  const ratingValue = toRatingFilter(initialRating);

  function setPage(page: number) {
    const u = new URLSearchParams();
    if (ratingValue !== "all") u.set("rating", ratingValue);
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
          리뷰 리스트
        </h1>
        <StatusFilter
          options={RATING_OPTIONS}
          value={ratingValue}
          paramName="rating"
        />
      </div>
      {initialData.length === 0 ? (
        <div className="p-5">
          <p style={{ ...tdStyle, color: "var(--admin-text-tertiary)" }}>
            리뷰가 없습니다.
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
                  리뷰 ID
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  작성자 이메일
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  상품명
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  평점
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  내용
                </th>
                <th className="px-5 text-left" style={thStyle}>
                  작성일
                </th>
              </tr>
            </thead>
            <tbody>
              {initialData.map((row) => {
                const preview =
                  row.content && row.content.length > 30
                    ? `${row.content.slice(0, 30)}…`
                    : row.content ?? "(내용 없음)";
                return (
                  <tr
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(getAdminReviewDetailUrl(row.id))}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      router.push(getAdminReviewDetailUrl(row.id))
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
                        href={getAdminReviewDetailUrl(row.id)}
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
                      style={{
                        color: "var(--admin-text-primary)",
                        ...tdStyle,
                      }}
                    >
                      {row.user_email ?? "-"}
                    </td>
                    <td
                      className="px-5"
                      style={{
                        color: "var(--admin-text-primary)",
                        ...tdStyle,
                      }}
                    >
                      {row.product_name || row.product_id}
                    </td>
                    <td
                      className="px-5"
                      style={{
                        color: "var(--admin-text-primary)",
                        ...tdStyle,
                        fontSize: "var(--admin-text-sm)",
                      }}
                    >
                      {renderStars(row.rating)} ({row.rating})
                    </td>
                    <td
                      className="px-5"
                      style={{
                        color: "var(--admin-text-secondary)",
                        ...tdStyle,
                        fontSize: "var(--admin-text-sm)",
                      }}
                    >
                      {preview}
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
                );
              })}
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
