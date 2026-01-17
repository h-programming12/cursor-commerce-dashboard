import React from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { OrderSummaryItem, ShippingOption } from "../types";

export interface OrderSummaryPanelProps {
  items: OrderSummaryItem[];
  subtotal: number;
  shipping?: {
    options: ShippingOption[];
  };
  discount?: number;
  total: number;
  onShippingChange?: (optionIndex: number) => void;
  className?: string;
}

const RadioIcon: React.FC<{ checked: boolean }> = ({ checked }) => (
  <div
    className="flex items-center justify-center"
    style={{
      width: "18px",
      height: "18px",
      borderRadius: "100%",
      border: `1px solid ${
        checked
          ? commerceColors.neutral["07"]["100"]
          : commerceColors.neutral["07"]["100"]
      }`,
      backgroundColor: checked
        ? commerceColors.neutral["07"]["100"]
        : "transparent",
    }}
  >
    {checked && (
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "100%",
          backgroundColor: commerceColors.background.default,
        }}
      />
    )}
  </div>
);

export const OrderSummaryPanel = React.forwardRef<
  HTMLDivElement,
  OrderSummaryPanelProps
>(
  (
    { items, subtotal, shipping, discount, total, onShippingChange, className },
    ref
  ) => {
    const handleShippingOptionClick = (index: number) => {
      onShippingChange?.(index);
    };

    return (
      <div
        ref={ref}
        className={cn("space-y-6", className)}
        role="complementary"
        aria-label="Order summary"
      >
        {/* 주문 아이템 목록 */}
        <div className="space-y-4">
          <h3
            className="mb-4"
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

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
                role="listitem"
              >
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: `${commerceTypography.body["2"].fontSize}px`,
                      lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
                      fontFamily: commerceTypography.body["2"].fontFamily,
                      fontWeight: commerceTypography.body["2"].fontWeight,
                      color: commerceColors.text.primary,
                    }}
                  >
                    {item.name}
                  </p>
                  <p
                    style={{
                      fontSize: `${commerceTypography.caption["2"].fontSize}px`,
                      lineHeight: `${commerceTypography.caption["2"].lineHeight}px`,
                      fontFamily: commerceTypography.caption["2"].fontFamily,
                      fontWeight: commerceTypography.caption["2"].fontWeight,
                      color: commerceColors.text.tertiary,
                    }}
                  >
                    Quantity: {item.quantity}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: `${commerceTypography.body["2"].fontSize}px`,
                    lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
                    fontFamily: commerceTypography.body["2"].fontFamily,
                    fontWeight: commerceTypography.body["2"].fontWeight,
                    color: commerceColors.text.primary,
                  }}
                >
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 배송 옵션 */}
        {shipping && shipping.options.length > 0 && (
          <div className="space-y-3">
            <h4
              style={{
                fontSize: `${commerceTypography.body["2-semi"].fontSize}px`,
                lineHeight: `${commerceTypography.body["2-semi"].lineHeight}px`,
                fontFamily: commerceTypography.body["2-semi"].fontFamily,
                fontWeight: commerceTypography.body["2-semi"].fontWeight,
                color: commerceColors.text.primary,
              }}
            >
              Shipping
            </h4>

            <div className="space-y-2">
              {shipping.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleShippingOptionClick(index)}
                  className={cn(
                    "flex items-center justify-between w-full p-4 transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#141718]",
                    option.selected && "ring-2 ring-offset-1 ring-[#141718]"
                  )}
                  style={{
                    backgroundColor: commerceColors.background.light,
                    border: `1px solid ${commerceColors.neutral["07"]["100"]}`,
                    borderRadius: "4px",
                  }}
                  aria-label={`Select shipping option: ${option.label}`}
                  aria-pressed={option.selected}
                >
                  <div className="flex items-center gap-3">
                    <RadioIcon checked={option.selected} />
                    <span
                      style={{
                        fontSize: `${commerceTypography.body["2"].fontSize}px`,
                        lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
                        fontFamily: commerceTypography.body["2"].fontFamily,
                        fontWeight: commerceTypography.body["2"].fontWeight,
                        color: commerceColors.text.primary,
                      }}
                    >
                      {option.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: `${commerceTypography.body["2"].fontSize}px`,
                      lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
                      fontFamily: commerceTypography.body["2"].fontFamily,
                      fontWeight: commerceTypography.body["2"].fontWeight,
                      color: commerceColors.text.primary,
                    }}
                  >
                    ${option.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 요약 */}
        <div
          className="space-y-3 border-t pt-4"
          style={{ borderColor: commerceColors.neutral["03"]["100"] }}
        >
          <div className="flex items-center justify-between">
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

          {discount !== undefined && discount > 0 && (
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: `${commerceTypography.body["2"].fontSize}px`,
                  lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
                  fontFamily: commerceTypography.body["2"].fontFamily,
                  fontWeight: commerceTypography.body["2"].fontWeight,
                  color: commerceColors.text.primary,
                }}
              >
                Discount
              </span>
              <span
                style={{
                  fontSize: `${commerceTypography.body["2"].fontSize}px`,
                  lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
                  fontFamily: commerceTypography.body["2"].fontFamily,
                  fontWeight: commerceTypography.body["2"].fontWeight,
                  color: commerceColors.semantic.success,
                }}
              >
                -${discount.toFixed(2)}
              </span>
            </div>
          )}

          <div
            className="flex items-center justify-between pt-2 border-t"
            style={{ borderColor: commerceColors.neutral["03"]["100"] }}
          >
            <span
              style={{
                fontSize: `${commerceTypography.body["1-semi"].fontSize}px`,
                lineHeight: `${commerceTypography.body["1-semi"].lineHeight}px`,
                fontFamily: commerceTypography.body["1-semi"].fontFamily,
                fontWeight: commerceTypography.body["1-semi"].fontWeight,
                color: commerceColors.text.primary,
              }}
            >
              Total
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
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

OrderSummaryPanel.displayName = "OrderSummaryPanel";
