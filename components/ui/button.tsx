import React from "react";
import { cn } from "@/commons/utils/cn";
import { commerceTypography } from "@/commons/constants/typography";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  size?: "small" | "medium" | "large";
  pill?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "medium",
      pill = false,
      icon,
      iconPosition = "left",
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantStyles = {
      primary:
        "bg-[#141718] text-white hover:bg-[#23262F] focus-visible:ring-[#141718]",
      outline:
        "border border-[#141718] bg-transparent text-[#141718] hover:bg-[#F3F5F7] focus-visible:ring-[#141718]",
    };

    const sizeStyles = {
      small: {
        height: "40px",
        paddingX: "16px",
        fontSize: commerceTypography.button.s.fontSize,
        lineHeight: commerceTypography.button.s.lineHeight,
        letterSpacing: "-0.4px",
        borderRadius: pill ? "80px" : "8px",
      },
      medium: {
        height: "48px",
        paddingX: "24px",
        fontSize: commerceTypography.button.s.fontSize,
        lineHeight: commerceTypography.button.s.lineHeight,
        letterSpacing: "-0.4px",
        borderRadius: pill ? "80px" : "8px",
      },
      large: {
        height: "52px",
        paddingX: "24px",
        fontSize: commerceTypography.button.m.fontSize,
        lineHeight: commerceTypography.button.m.lineHeight,
        letterSpacing: "-0.4px",
        borderRadius: pill ? "80px" : "8px",
      },
    };

    const currentSize = sizeStyles[size];

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        style={{
          height: currentSize.height,
          paddingLeft: currentSize.paddingX,
          paddingRight: currentSize.paddingX,
          fontSize: `${currentSize.fontSize}px`,
          lineHeight: currentSize.lineHeight,
          letterSpacing: `${currentSize.letterSpacing}px`,
          borderRadius: currentSize.borderRadius,
          fontFamily: commerceTypography.button.s.fontFamily,
          fontWeight: commerceTypography.button.s.fontWeight,
        }}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2">Loading...</span>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="mr-2 flex items-center">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="ml-2 flex items-center">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
