import React from "react";
import Link from "next/link";
import { ADMIN_URLS } from "@/commons/constants/url";

export interface RecentOrderItem {
  id: string;
  user_id: string;
  user_email: string | null;
  status: string;
  total_amount: number;
  created_at: string | null;
}

interface RecentOrdersTableProps {
  orders: RecentOrderItem[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
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

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
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
        style={{
          borderColor: "var(--admin-neutral-03-100)",
        }}
      >
        <h3
          style={{
            fontSize: "var(--admin-headline-h7-font-size)",
            lineHeight: 1.2,
            fontFamily: "var(--admin-font-poppins)",
            fontWeight: "var(--admin-font-medium)",
            color: "var(--admin-text-primary)",
          }}
        >
          Recent Orders
        </h3>
      </div>
      {orders.length === 0 ? (
        <div className="p-5">
          <p
            style={{
              fontSize: "var(--admin-text-md)",
              lineHeight: 1.5,
              fontFamily: "var(--admin-font-public-sans)",
              color: "var(--admin-text-tertiary)",
            }}
          >
            최근 주문이 없습니다.
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
                <th
                  className="px-5 text-left"
                  style={{
                    fontSize: "var(--admin-caption-2-semi-font-size)",
                    lineHeight: 1.4,
                    fontFamily: "var(--admin-font-inter)",
                    fontWeight: "var(--admin-font-semibold)",
                    color: "var(--admin-text-tertiary)",
                  }}
                >
                  주문 ID
                </th>
                <th
                  className="px-5 text-left"
                  style={{
                    fontSize: "var(--admin-caption-2-semi-font-size)",
                    lineHeight: 1.4,
                    fontFamily: "var(--admin-font-inter)",
                    fontWeight: "var(--admin-font-semibold)",
                    color: "var(--admin-text-tertiary)",
                  }}
                >
                  이메일
                </th>
                <th
                  className="px-5 text-left"
                  style={{
                    fontSize: "var(--admin-caption-2-semi-font-size)",
                    lineHeight: 1.4,
                    fontFamily: "var(--admin-font-inter)",
                    fontWeight: "var(--admin-font-semibold)",
                    color: "var(--admin-text-tertiary)",
                  }}
                >
                  상태
                </th>
                <th
                  className="px-5 text-right"
                  style={{
                    fontSize: "var(--admin-caption-2-semi-font-size)",
                    lineHeight: 1.4,
                    fontFamily: "var(--admin-font-inter)",
                    fontWeight: "var(--admin-font-semibold)",
                    color: "var(--admin-text-tertiary)",
                  }}
                >
                  금액
                </th>
                <th
                  className="px-5 text-left"
                  style={{
                    fontSize: "var(--admin-caption-2-semi-font-size)",
                    lineHeight: 1.4,
                    fontFamily: "var(--admin-font-inter)",
                    fontWeight: "var(--admin-font-semibold)",
                    color: "var(--admin-text-tertiary)",
                  }}
                >
                  주문일시
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  style={{
                    height: "var(--admin-table-row-height)",
                    borderTop: "1px solid var(--admin-border-table-cell)",
                  }}
                >
                  <td className="px-5">
                    <Link
                      href={`${ADMIN_URLS.ORDERS}?id=${order.id}`}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{
                        fontSize: "var(--admin-text-md)",
                        lineHeight: 1.5,
                        fontFamily: "var(--admin-font-public-sans)",
                        color: "var(--admin-semantic-info)",
                      }}
                    >
                      {order.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td
                    className="px-5"
                    style={{
                      fontSize: "var(--admin-text-md)",
                      lineHeight: 1.5,
                      fontFamily: "var(--admin-font-public-sans)",
                      color: "var(--admin-text-primary)",
                    }}
                  >
                    {order.user_email ?? order.user_id}
                  </td>
                  <td
                    className="px-5"
                    style={{
                      fontSize: "var(--admin-text-md)",
                      lineHeight: 1.5,
                      fontFamily: "var(--admin-font-public-sans)",
                      color: "var(--admin-text-secondary)",
                    }}
                  >
                    {order.status}
                  </td>
                  <td
                    className="px-5 text-right"
                    style={{
                      fontSize: "var(--admin-text-md)",
                      lineHeight: 1.5,
                      fontFamily: "var(--admin-font-public-sans)",
                      color: "var(--admin-text-primary)",
                    }}
                  >
                    {formatAmount(order.total_amount)}
                  </td>
                  <td
                    className="px-5"
                    style={{
                      fontSize: "var(--admin-text-sm)",
                      lineHeight: 1.5,
                      fontFamily: "var(--admin-font-public-sans)",
                      color: "var(--admin-text-tertiary)",
                    }}
                  >
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
