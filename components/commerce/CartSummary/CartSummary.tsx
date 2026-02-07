"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";

export interface CartSummaryProps {
  subtotal: number;
  className?: string;
}

export const CartSummary = React.forwardRef<HTMLDivElement, CartSummaryProps>(
  ({ subtotal, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        role="complementary"
        aria-label="Order summary"
      >
        <h3
          style={{
            fontSize: `${commerceTypography.body["1-semi"].fontSize}px`,
            lineHeight: `${commerceTypography.body["1-semi"].lineHeight}px`,
            fontFamily: commerceTypography.body["1-semi"].fontFamily,
            fontWeight: commerceTypography.body["1-semi"].fontWeight,
            color: commerceColors.text.primary,
          }}
        >
          Order Summary
        </h3>
        <div
          className="flex items-center justify-between border-t border-b py-4"
          style={{ borderColor: commerceColors.neutral["03"]["100"] }}
        >
          <span
            style={{
              fontSize: `${commerceTypography.body["2"].fontSize}px`,
              lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
              fontFamily: commerceTypography.body["2"].fontFamily,
              fontWeight: commerceTypography.body["2"].fontWeight,
              color: commerceColors.text.primary,
            }}
          >
            Subtotal
          </span>
          <span
            style={{
              fontSize: `${commerceTypography.body["2"].fontSize}px`,
              lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
              fontFamily: commerceTypography.body["2"].fontFamily,
              fontWeight: commerceTypography.body["2"].fontWeight,
              color: commerceColors.text.primary,
            }}
          >
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <Link
          href={ACCOUNT_URLS.CHECKOUT}
          className={cn(
            "flex items-center justify-center w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141718]"
          )}
          style={{
            height: "52px",
            borderRadius: "8px",
            backgroundColor: commerceColors.neutral["07"]["100"],
            color: commerceColors.text.inverse,
            fontFamily: commerceTypography.button.m.fontFamily,
            fontSize: `${commerceTypography.button.m.fontSize}px`,
            lineHeight: commerceTypography.button.m.lineHeight,
            fontWeight: commerceTypography.button.m.fontWeight,
            letterSpacing: "-0.4px",
          }}
          aria-label="Proceed to checkout"
        >
          Proceed to Checkout
        </Link>
        <Link
          href={COMMERCE_URLS.PRODUCTS}
          className="block text-center transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#141718]"
          style={{
            fontSize: `${commerceTypography.body["2"].fontSize}px`,
            lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
            fontFamily: commerceTypography.body["2"].fontFamily,
            fontWeight: commerceTypography.body["2"].fontWeight,
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
