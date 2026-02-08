"use client";

import React from "react";
import Image from "next/image";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { formatPrice } from "@/commons/utils/formatPrice";

export interface OrderSummaryLineItem {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  color?: string;
}

export interface OrderSummaryProps {
  lineItems: OrderSummaryLineItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  className?: string;
}

export function OrderSummary({
  lineItems,
  subtotal,
  shippingFee,
  discount,
  total,
  className,
}: OrderSummaryProps) {
  return (
    <div
      className={className}
      role="complementary"
      aria-label="Order summary"
      style={{
        border: `1px solid ${commerceColors.neutral["04"]["100"]}`,
        borderRadius: "6px",
        backgroundColor: commerceColors.background.default,
        padding: "16px",
      }}
    >
      <h2
        style={{
          fontFamily: commerceTypography.headline.h6.fontFamily,
          fontWeight: commerceTypography.headline.h6.fontWeight,
          fontSize: "28px",
          lineHeight: "34px",
          letterSpacing: "-0.6px",
          color: commerceColors.text.primary,
          marginBottom: "16px",
        }}
      >
        Order summary
      </h2>

      <div
        className="space-y-4"
        style={{
          borderBottom: `1px solid ${commerceColors.neutral["03"]["100"]}`,
          paddingBottom: "16px",
          marginBottom: "16px",
        }}
      >
        {lineItems.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4"
            style={{
              borderBottom: `1px solid ${commerceColors.neutral["03"]["100"]}`,
              paddingBottom: "14px",
            }}
          >
            <div
              className="shrink-0 overflow-hidden rounded"
              style={{
                width: 80,
                height: 96,
                backgroundColor: commerceColors.background.light,
              }}
            >
              {item.productImageUrl ? (
                <Image
                  src={item.productImageUrl}
                  alt={item.productName}
                  width={80}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{ backgroundColor: commerceColors.background.light }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                style={{
                  fontFamily: commerceTypography.body["2-semi"].fontFamily,
                  fontWeight: commerceTypography.body["2-semi"].fontWeight,
                  fontSize: "14px",
                  lineHeight: "22px",
                  color: commerceColors.text.primary,
                }}
              >
                {item.productName}
              </p>
              {item.color != null && item.color !== "" && (
                <p
                  style={{
                    fontFamily: commerceTypography.caption["1"].fontFamily,
                    fontWeight: commerceTypography.caption["1"].fontWeight,
                    fontSize: "12px",
                    lineHeight: "20px",
                    color: commerceColors.text.tertiary,
                  }}
                >
                  Color: {item.color}
                </p>
              )}
              <p
                style={{
                  fontFamily: commerceTypography.body["2-semi"].fontFamily,
                  fontWeight: commerceTypography.body["2-semi"].fontWeight,
                  fontSize: "14px",
                  lineHeight: "22px",
                  color: commerceColors.text.primary,
                  marginTop: "4px",
                }}
              >
                {formatPrice(item.lineTotal)}
              </p>
            </div>
            <div
              className="shrink-0 text-right"
              style={{
                fontFamily: commerceTypography.caption["1-semi"].fontFamily,
                fontWeight: commerceTypography.caption["1-semi"].fontWeight,
                fontSize: "12px",
                lineHeight: "20px",
                color: commerceColors.text.tertiary,
              }}
            >
              Qty {item.quantity}
            </div>
          </div>
        ))}
      </div>

      <div
        className="space-y-3"
        style={{
          fontFamily: commerceTypography.body["2"].fontFamily,
          fontSize: "16px",
          lineHeight: "26px",
          color: commerceColors.text.primary,
        }}
      >
        <div
          className="flex justify-between items-center py-3 px-4 rounded"
          style={{
            backgroundColor: commerceColors.background.light,
            border: `1px solid ${commerceColors.neutral["03"]["100"]}`,
          }}
        >
          <span>Shipping</span>
          <span
            style={{
              fontWeight: 600,
            }}
          >
            {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
          </span>
        </div>
        <div
          className="flex justify-between py-3 border-t border-b"
          style={{ borderColor: commerceColors.neutral["03"]["100"] }}
        >
          <span>Subtotal</span>
          <span style={{ fontWeight: 600 }}>
            {formatPrice(Math.round(subtotal))}
          </span>
        </div>
        {discount > 0 && (
          <div
            className="flex justify-between py-3 border-b"
            style={{ borderColor: commerceColors.neutral["03"]["100"] }}
          >
            <span>Discount</span>
            <span
              style={{
                fontWeight: 600,
                color: commerceColors.semantic.success,
              }}
            >
              -{formatPrice(discount)}
            </span>
          </div>
        )}
        <div
          className="flex justify-between pt-2"
          style={{
            fontFamily: commerceTypography.headline.h7.fontFamily,
            fontWeight: commerceTypography.headline.h7.fontWeight,
            fontSize: "20px",
            lineHeight: "28px",
            color: commerceColors.text.primary,
          }}
        >
          <span>Total</span>
          <span>{formatPrice(Math.round(total))}</span>
        </div>
      </div>
    </div>
  );
}
