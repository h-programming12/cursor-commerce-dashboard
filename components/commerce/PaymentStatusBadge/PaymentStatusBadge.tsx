"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  requested: "결제대기",
  success: "결제완료",
  failed: "결제실패",
  refund_requested: "환불요청",
  refund_completed: "환불완료",
};

type BadgeVariant = "default" | "success" | "warning" | "error";

function getPaymentStatusVariant(status: string): BadgeVariant {
  const lower = status.toLowerCase();
  if (lower === "success") return "success";
  if (lower === "failed" || lower === "refund_completed") return "error";
  if (lower === "refund_requested") return "warning";
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

export interface PaymentStatusBadgeProps {
  status: string;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const variant = getPaymentStatusVariant(status);
  const label = PAYMENT_STATUS_LABEL[status.toLowerCase()] ?? status;
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
