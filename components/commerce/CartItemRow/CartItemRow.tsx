import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import { COMMERCE_URLS } from "@/commons/constants/url";

export interface CartItemRowProps {
  item: {
    id: string;
    productId: string;
    productName: string;
    productImageUrl: string;
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
        className={cn(
          "flex items-start gap-4 border-b border-t py-6",
          className
        )}
        style={{
          borderColor: commerceColors.neutral["03"]["100"],
        }}
        role="listitem"
        aria-label={`Cart item: ${item.productName}`}
      >
        {/* 이미지 */}
        <Link href={productUrl} className="flex-shrink-0">
          <div
            className="relative overflow-hidden"
            style={{
              width: "80px",
              height: "96px",
              borderRadius: "4px",
            }}
          >
            <Image
              src={item.productImageUrl}
              alt={item.productName}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        </Link>

        {/* 제품 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link href={productUrl}>
                <h3
                  className="mb-1 line-clamp-2"
                  style={{
                    fontSize: `${commerceTypography.caption["1-semi"].fontSize}px`,
                    lineHeight: `${commerceTypography.caption["1-semi"].lineHeight}px`,
                    fontFamily: commerceTypography.caption["1-semi"].fontFamily,
                    fontWeight: commerceTypography.caption["1-semi"].fontWeight,
                    color: commerceColors.text.primary,
                  }}
                >
                  {item.productName}
                </h3>
              </Link>

              {item.color && (
                <p
                  className="mb-3"
                  style={{
                    fontSize: `${commerceTypography.caption["2"].fontSize}px`,
                    lineHeight: `${commerceTypography.caption["2"].lineHeight}px`,
                    fontFamily: commerceTypography.caption["2"].fontFamily,
                    fontWeight: commerceTypography.caption["2"].fontWeight,
                    color: commerceColors.text.tertiary,
                  }}
                >
                  Color: {item.color}
                </p>
              )}

              {/* Remove 버튼 */}
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#141718]"
                style={{
                  fontSize: `${commerceTypography.caption["1-semi"].fontSize}px`,
                  lineHeight: `${commerceTypography.caption["1-semi"].lineHeight}px`,
                  fontFamily: commerceTypography.caption["1-semi"].fontFamily,
                  fontWeight: commerceTypography.caption["1-semi"].fontWeight,
                  color: commerceColors.text.tertiary,
                }}
                aria-label={`Remove ${item.productName} from cart`}
              >
                <CloseIcon />
                <span>Remove</span>
              </button>
            </div>

            {/* 수량 및 가격 */}
            <div className="flex items-center gap-6">
              {/* 수량 선택기 */}
              <QuantitySelector
                value={item.quantity}
                min={1}
                onChange={handleQuantityChange}
                size="small"
                aria-label={`Quantity for ${item.productName}`}
              />

              {/* 가격 */}
              <div className="flex flex-col items-end gap-1 min-w-[120px]">
                <span
                  style={{
                    fontSize: `${commerceTypography.body["1"].fontSize}px`,
                    lineHeight: `${commerceTypography.body["1"].lineHeight}px`,
                    fontFamily: commerceTypography.body["1"].fontFamily,
                    fontWeight: commerceTypography.body["1"].fontWeight,
                    color: commerceColors.text.primary,
                  }}
                >
                  ${item.unitPrice.toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: `${commerceTypography.body["1-semi"].fontSize}px`,
                    lineHeight: `${commerceTypography.body["1-semi"].lineHeight}px`,
                    fontFamily: commerceTypography.body["1-semi"].fontFamily,
                    fontWeight: commerceTypography.body["1-semi"].fontWeight,
                    color: commerceColors.text.primary,
                  }}
                >
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CartItemRow.displayName = "CartItemRow";

