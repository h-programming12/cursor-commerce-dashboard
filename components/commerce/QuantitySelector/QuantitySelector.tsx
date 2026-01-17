import React from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

export interface QuantitySelectorProps {
  value: number;
  min?: number; // 기본값 1
  max?: number;
  size?: "small" | "medium" | "large";
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const MinusIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 8H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 4V12M4 8H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const QuantitySelector = React.forwardRef<
  HTMLDivElement,
  QuantitySelectorProps
>(
  (
    {
      value,
      min = 1,
      max,
      size = "medium",
      onChange,
      disabled = false,
      className,
    },
    ref
  ) => {
    const handleDecrease = () => {
      if (disabled || value <= min) return;
      onChange(value - 1);
    };

    const handleIncrease = () => {
      if (disabled || (max !== undefined && value >= max)) return;
      onChange(value + 1);
    };

    const isMinDisabled = disabled || value <= min;
    const isMaxDisabled = disabled || (max !== undefined && value >= max);

    const sizeStyles = {
      small: {
        width: "80px",
        height: "32px",
        borderRadius: "4px",
        fontSize: commerceTypography.caption["2-bold"].fontSize,
        lineHeight: commerceTypography.caption["2-bold"].lineHeight,
        iconSize: 16,
        borderColor: commerceColors.neutral["04"]["100"],
        backgroundColor: "transparent",
      },
      medium: {
        width: "127px",
        height: "52px",
        borderRadius: "8px",
        fontSize: commerceTypography.button.s.fontSize,
        lineHeight: commerceTypography.button.s.lineHeight,
        iconSize: 20,
        borderColor: "transparent",
        backgroundColor: "#F5F5F5",
      },
      large: {
        width: "127px",
        height: "52px",
        borderRadius: "8px",
        fontSize: commerceTypography.button.m.fontSize,
        lineHeight: commerceTypography.button.m.lineHeight,
        iconSize: 20,
        borderColor: "transparent",
        backgroundColor: "#F5F5F5",
      },
    };

    const currentSize = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center justify-between", className)}
        style={{
          width: currentSize.width,
          height: currentSize.height,
          borderRadius: currentSize.borderRadius,
          backgroundColor: currentSize.backgroundColor,
          border:
            size === "small" ? `1px solid ${currentSize.borderColor}` : "none",
        }}
        role="group"
        aria-label="Quantity selector"
      >
        <button
          type="button"
          onClick={handleDecrease}
          disabled={isMinDisabled}
          className={cn(
            "flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#141718]",
            isMinDisabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:opacity-70"
          )}
          style={{
            width: currentSize.height,
            height: currentSize.height,
            color: commerceColors.neutral["07"]["100"],
          }}
          aria-label="Decrease quantity"
          aria-disabled={isMinDisabled}
        >
          <MinusIcon size={currentSize.iconSize} />
        </button>

        <span
          className="flex items-center justify-center flex-1"
          style={{
            fontSize: `${currentSize.fontSize}px`,
            lineHeight: currentSize.lineHeight,
            fontFamily: commerceTypography.button.s.fontFamily,
            fontWeight: 600,
            color: commerceColors.neutral["07"]["100"],
          }}
          aria-label={`Current quantity: ${value}`}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={handleIncrease}
          disabled={isMaxDisabled}
          className={cn(
            "flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#141718]",
            isMaxDisabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:opacity-70"
          )}
          style={{
            width: currentSize.height,
            height: currentSize.height,
            color: commerceColors.neutral["07"]["100"],
          }}
          aria-label="Increase quantity"
          aria-disabled={isMaxDisabled}
        >
          <PlusIcon size={currentSize.iconSize} />
        </button>
      </div>
    );
  }
);

QuantitySelector.displayName = "QuantitySelector";
