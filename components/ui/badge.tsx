import React from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "new" | "discount";
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center px-2 font-bold rounded transition-colors";

    const variantStyles = {
      default: {
        backgroundColor: commerceColors.background.default,
        color: commerceColors.neutral["07"]["100"],
      },
      success: {
        backgroundColor: commerceColors.semantic.success,
        color: "#FEFEFE",
      },
      new: {
        backgroundColor: commerceColors.background.default,
        color: commerceColors.neutral["07"]["100"],
      },
      discount: {
        backgroundColor: commerceColors.semantic.success,
        color: "#FEFEFE",
      },
    };

    const currentVariant = variantStyles[variant];

    return (
      <span
        ref={ref}
        className={cn(baseStyles, className)}
        style={{
          height: "24px",
          fontSize: `${commerceTypography.caption["1-bold"].fontSize}px`,
          lineHeight: `${commerceTypography.caption["1-bold"].fontSize}px`,
          borderRadius: "4px",
          backgroundColor: currentVariant.backgroundColor,
          color: currentVariant.color,
          fontFamily: commerceTypography.caption["1-bold"].fontFamily,
          fontWeight: commerceTypography.caption["1-bold"].fontWeight,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
