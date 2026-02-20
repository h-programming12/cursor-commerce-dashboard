"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "대기중",
  paid: "결제완료",
  processing: "처리중",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
  canceled: "취소",
  refunded: "환불완료",
};

type BadgeVariant = "default" | "success" | "warning" | "error";

function getOrderStatusVariant(status: string): BadgeVariant {
  const lower = status.toLowerCase();
  if (lower === "delivered" || lower === "paid") return "success";
  if (lower === "cancelled" || lower === "canceled" || lower === "refunded")
    return "error";
  if (lower === "shipped" || lower === "processing") return "warning";
  return "default";
}

const variantStyles: Record<
  BadgeVariant,
  { backgroundColor: string; color: string }
> = {
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

export interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const variant = getOrderStatusVariant(status);
  const label = ORDER_STATUS_LABEL[status.toLowerCase()] ?? status;
  const style = variantStyles[variant];

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: 4,
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
