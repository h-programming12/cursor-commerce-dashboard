"use client";

import { useRouter } from "next/navigation";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { formatPrice } from "@/commons/utils/formatPrice";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

export interface OrderRow {
  id: string;
  created_at: string | null;
  status: string;
  total_amount: number;
}

export interface OrdersTableProps {
  orders: OrderRow[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: "대기중",
  paid: "결제완료",
  processing: "처리중",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
};

function formatOrderDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusBadgeVariant(
  status: string
): "default" | "success" | "warning" | "error" {
  const lower = status.toLowerCase();
  if (lower === "delivered" || lower === "paid") return "success";
  if (lower === "cancelled") return "error";
  if (lower === "shipped" || lower === "processing") return "warning";
  return "default";
}

function StatusBadge({ status }: { status: string }) {
  const variant = getStatusBadgeVariant(status);
  const label = STATUS_LABEL[status.toLowerCase()] ?? status;

  const variantStyles = {
    default: {
      backgroundColor: commerceColors.background.light,
      color: commerceColors.text.secondary,
    },
    success: {
      backgroundColor: commerceColors.semantic.success + "20",
      color: commerceColors.semantic.success,
    },
    warning: {
      backgroundColor: commerceColors.semantic.warning + "20",
      color: commerceColors.semantic.warning,
    },
    error: {
      backgroundColor: commerceColors.semantic.error + "20",
      color: commerceColors.semantic.error,
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-center"
      style={{
        fontSize: commerceTypography.caption["1"].fontSize,
        lineHeight: "22px",
        fontFamily: commerceTypography.caption["1"].fontFamily,
        fontWeight: 400,
        ...style,
      }}
    >
      {label}
    </span>
  );
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();

  const captionStyle = {
    fontSize: 14,
    lineHeight: "22px",
    fontFamily: commerceTypography.caption["1"].fontFamily,
    fontWeight: 400,
    color: commerceColors.text.tertiary,
  };

  const cellStyle = {
    fontSize: 14,
    lineHeight: "22px",
    fontFamily: commerceTypography.caption["1"].fontFamily,
    fontWeight: 400,
    color: commerceColors.neutral["07"]["100"],
  };

  const borderColor = commerceColors.neutral["03"]["100"];

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr className="border-b" style={{ borderColor }}>
            <th
              className="text-left py-3 pr-4"
              style={{ ...captionStyle, width: "180px" }}
            >
              Number ID
            </th>
            <th
              className="text-left py-3 pr-4"
              style={{ ...captionStyle, width: "180px" }}
            >
              Dates
            </th>
            <th
              className="text-left py-3 pr-4"
              style={{ ...captionStyle, width: "140px" }}
            >
              Status
            </th>
            <th className="text-left py-3" style={captionStyle}>
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(ACCOUNT_URLS.ORDER_DETAIL(order.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(ACCOUNT_URLS.ORDER_DETAIL(order.id));
                }
              }}
              className={cn(
                "border-b align-middle cursor-pointer transition-colors",
                "hover:bg-(--commerce-background-light) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-primary-main)"
              )}
              style={{ borderColor }}
              aria-label={`주문 ${order.id} 상세 보기`}
            >
              <td
                className="py-4 pr-4"
                style={{ ...cellStyle, width: "160px" }}
              >
                #{order.id.slice(0, 8)}
              </td>
              <td
                className="py-4 pr-4"
                style={{ ...cellStyle, width: "120px" }}
              >
                {formatOrderDate(order.created_at)}
              </td>
              <td className="py-4 pr-4" style={{ width: "120px" }}>
                <StatusBadge status={order.status} />
              </td>
              <td className="py-4" style={cellStyle}>
                {formatPrice(order.total_amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
