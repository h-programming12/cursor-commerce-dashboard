import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { formatPrice } from "@/commons/utils/formatPrice";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import { COMMERCE_URLS } from "@/commons/constants/url";

export interface CartItemRowProps {
  item: {
    id: string;
    productId: string;
    productName: string;
    productImageUrl: string | null;
    color?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  };
  onQuantityChange?: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
  className?: string;
}

const CloseIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CartItemRow = React.forwardRef<HTMLDivElement, CartItemRowProps>(
  ({ item, onQuantityChange, onRemove, className }, ref) => {
    const handleQuantityChange = (newQuantity: number) => {
      onQuantityChange?.(item.id, newQuantity);
    };

    const handleRemove = () => {
      onRemove?.(item.id);
    };

    const productUrl = COMMERCE_URLS.PRODUCT_DETAIL(item.productId);

    return (
      <div
        ref={ref}
        className={cn("px-4 py-6 border-b", className)}
        style={{
          borderColor: commerceColors.neutral["03"]["100"],
        }}
        role="listitem"
        aria-label={`Cart item: ${item.productName}`}
      >
        <div className="md:hidden flex flex-col gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <Link href={productUrl} className="shrink-0">
              <div className="relative w-20 h-24 overflow-hidden rounded bg-(--commerce-neutral-03-100)">
                {item.productImageUrl ? (
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: commerceColors.neutral["03"]["100"],
                    }}
                    aria-hidden
                  />
                )}
              </div>
            </Link>
            <div className="min-w-0 flex flex-1 flex-col gap-3">
              <Link href={productUrl}>
                <h3
                  className="line-clamp-2"
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.text.primary,
                  }}
                >
                  {item.productName}
                </h3>
              </Link>
              {item.color && (
                <p
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "20px",
                    color: commerceColors.text.tertiary,
                  }}
                >
                  Color: {item.color}
                </p>
              )}
              <div>
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.text.tertiary,
                  }}
                >
                  {formatPrice(Math.round(item.unitPrice))}
                </p>
                <QuantitySelector
                  value={item.quantity}
                  min={1}
                  onChange={handleQuantityChange}
                  size="small"
                  aria-label={`Quantity for ${item.productName}`}
                />
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="cursor-pointer inline-flex items-center gap-1 w-fit transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#141718]"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "24px",
                  color: commerceColors.text.tertiary,
                }}
                aria-label={`Remove ${item.productName} from cart`}
              >
                <CloseIcon />
                <span>Remove</span>
              </button>
            </div>
          </div>
          <div
            className="flex items-center justify-between border-t pt-3"
            style={{ borderColor: commerceColors.neutral["03"]["100"] }}
          >
            <span
              style={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "22px",
                color: commerceColors.text.tertiary,
              }}
            >
              Subtotal
            </span>
            <span
              style={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "18px",
                lineHeight: "30px",
                color: "#121212",
              }}
            >
              {formatPrice(Math.round(item.totalPrice))}
            </span>
          </div>
        </div>
        <div className="hidden md:grid md:grid-cols-[1fr_80px_1fr_1fr] gap-4 items-center min-h-[144px]">
          <div className="flex items-start gap-4 min-w-0">
            <Link href={productUrl} className="shrink-0">
              <div
                className="relative overflow-hidden bg-(--commerce-neutral-03-100)"
                style={{
                  width: "80px",
                  height: "96px",
                  borderRadius: "4px",
                }}
              >
                {item.productImageUrl ? (
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: commerceColors.neutral["03"]["100"],
                    }}
                    aria-hidden
                  />
                )}
              </div>
            </Link>
            <div className="min-w-0 flex flex-col gap-1">
              <Link href={productUrl}>
                <h3
                  className="line-clamp-2"
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.text.primary,
                  }}
                >
                  {item.productName}
                </h3>
              </Link>
              {item.color && (
                <p
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "20px",
                    color: commerceColors.text.tertiary,
                  }}
                >
                  Color: {item.color}
                </p>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="cursor-pointer inline-flex items-center gap-1 w-fit transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#141718]"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "24px",
                  color: commerceColors.text.tertiary,
                }}
                aria-label={`Remove ${item.productName} from cart`}
              >
                <CloseIcon />
                <span>Remove</span>
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <QuantitySelector
              value={item.quantity}
              min={1}
              onChange={handleQuantityChange}
              size="small"
              aria-label={`Quantity for ${item.productName}`}
            />
          </div>
          <div
            className="text-right"
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "30px",
              color: "#121212",
            }}
          >
            {formatPrice(Math.round(item.unitPrice))}
          </div>
          <div
            className="text-right"
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "18px",
              lineHeight: "30px",
              color: "#121212",
            }}
          >
            {formatPrice(Math.round(item.totalPrice))}
          </div>
        </div>
      </div>
    );
  }
);

CartItemRow.displayName = "CartItemRow";
