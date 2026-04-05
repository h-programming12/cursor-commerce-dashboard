"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { formatPrice } from "@/commons/utils/formatPrice";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";

export interface CartSummaryProps {
  subtotal: number;
  total: number;
  className?: string;
}

export const CartSummary = React.forwardRef<HTMLDivElement, CartSummaryProps>(
  ({ subtotal, total, className }, ref) => {
    const shippingFee = total - Math.round(subtotal);

    return (
      <div
        ref={ref}
        className={cn("rounded-md border p-6 space-y-6", className)}
        style={{
          borderColor: commerceColors.neutral["04"]["100"],
        }}
        role="complementary"
        aria-label="Cart summary"
      >
        <h3
          style={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "28px",
            color: commerceColors.text.primary,
          }}
        >
          Cart summary
        </h3>

        {/* Shipping */}
        <div
          className="flex items-center justify-between py-3 px-4 rounded"
          style={{
            backgroundColor: commerceColors.background.light,
            border: `1px solid ${commerceColors.neutral["07"]["100"]}`,
          }}
        >
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "26px",
              color: commerceColors.text.primary,
            }}
          >
            {shippingFee === 0 ? "Free shipping" : "Shipping"}
          </span>
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "26px",
              color: commerceColors.text.primary,
            }}
          >
            {formatPrice(shippingFee)}
          </span>
        </div>

        {/* Subtotal */}
        <div
          className="flex items-center justify-between py-3 border-t border-b"
          style={{
            borderColor: commerceColors.neutral["03"]["100"],
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "26px",
            color: commerceColors.text.primary,
          }}
        >
          <span>Subtotal</span>
          <span className="font-semibold">
            {formatPrice(Math.round(subtotal))}
          </span>
        </div>

        {/* Total */}
        <div
          className="flex items-center justify-between pt-2"
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "32px",
            color: commerceColors.text.primary,
          }}
        >
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <Link
          href={ACCOUNT_URLS.CHECKOUT}
          className={cn(
            "flex items-center justify-center w-full transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-neutral-07-100)"
          )}
          style={{
            height: "52px",
            borderRadius: "8px",
            backgroundColor: commerceColors.neutral["07"]["100"],
            color: commerceColors.text.inverse,
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "32px",
            letterSpacing: "-0.4px",
          }}
          aria-label="Checkout"
        >
          Checkout
        </Link>

        <Link
          href={COMMERCE_URLS.PRODUCTS}
          className="block text-center transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-(--commerce-neutral-07-100)"
          style={{
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "26px",
            color: commerceColors.text.tertiary,
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }
);

CartSummary.displayName = "CartSummary";
