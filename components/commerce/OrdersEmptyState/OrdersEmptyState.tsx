"use client";

import Link from "next/link";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { COMMERCE_URLS } from "@/commons/constants/url";

export function OrdersEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 rounded-lg"
      style={{ backgroundColor: commerceColors.background.light }}
    >
      <p
        className="mb-6 text-center"
        style={{
          fontSize: commerceTypography.body["2"].fontSize,
          lineHeight: "26px",
          fontFamily: commerceTypography.body["2"].fontFamily,
          fontWeight: 400,
          color: commerceColors.text.tertiary,
        }}
      >
        주문 내역이 없습니다.
      </p>
      <Link
        href={COMMERCE_URLS.PRODUCTS}
        className="inline-flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--commerce-primary-main)]"
        style={{
          padding: "12px 24px",
          backgroundColor: commerceColors.neutral["07"]["100"],
          color: commerceColors.text.inverse,
          fontSize: commerceTypography.button.s.fontSize,
          lineHeight: "24px",
          fontFamily: commerceTypography.button.s.fontFamily,
          fontWeight: 500,
        }}
      >
        쇼핑하러 가기
      </Link>
    </div>
  );
}
