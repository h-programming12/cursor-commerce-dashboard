import React, { useId } from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors, adminColors } from "@/commons/constants/color";
import {
  commerceTypography,
  adminTypography,
} from "@/commons/constants/typography";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "commerce" | "admin";
  error?: boolean;
  helperText?: string;
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "commerce",
      error = false,
      helperText,
      label,
      icon,
      iconPosition = "left",
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const baseStyles =
      "w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

    const variantStyles = {
      commerce: {
        height: "40px",
        paddingX: "16px",
        fontSize: commerceTypography.body["2"].fontSize,
        lineHeight: commerceTypography.body["2"].lineHeight,
        borderRadius: "6px",
        backgroundColor: commerceColors.background.default,
        borderColor: error ? commerceColors.semantic.error : "#CBCBCB",
        placeholderColor: commerceColors.text.tertiary,
        textColor: commerceColors.text.primary,
        focusRingColor: commerceColors.neutral["07"]["100"],
      },
      admin: {
        height: "40px",
        paddingX: "16px",
        fontSize: adminTypography.semantic.button.medium.fontSize,
        lineHeight: adminTypography.semantic.button.medium.lineHeight,
        borderRadius: "4px",
        backgroundColor: adminColors.background.default,
        borderColor: error ? adminColors.semantic.error : "#E9E7FD",
        placeholderColor: adminColors.text.stormGray || "#8B909A",
        textColor: adminColors.text.primary,
        focusRingColor: adminColors.neutral["07"]["100"],
      },
    };

    const currentVariant = variantStyles[variant];

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1 text-xs font-bold"
            style={{
              color:
                variant === "commerce"
                  ? commerceColors.text.tertiary
                  : adminColors.text.tertiary,
              fontSize: "12px",
              lineHeight: "12px",
            }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseStyles,
              icon && iconPosition === "left" ? "pl-10" : undefined,
              icon && iconPosition === "right" ? "pr-10" : undefined,
              className
            )}
            style={{
              height: currentVariant.height,
              paddingLeft:
                icon && iconPosition === "left"
                  ? "40px"
                  : currentVariant.paddingX,
              paddingRight:
                icon && iconPosition === "right"
                  ? "40px"
                  : currentVariant.paddingX,
              fontSize: `${currentVariant.fontSize}px`,
              lineHeight: currentVariant.lineHeight,
              borderRadius: currentVariant.borderRadius,
              backgroundColor: currentVariant.backgroundColor,
              border: `1px solid ${currentVariant.borderColor}`,
              color: currentVariant.textColor,
              fontFamily:
                variant === "commerce"
                  ? commerceTypography.body["2"].fontFamily
                  : adminTypography.semantic.button.medium.fontFamily,
              fontWeight:
                variant === "commerce"
                  ? commerceTypography.body["2"].fontWeight
                  : adminTypography.semantic.button.medium.fontWeight,
            }}
            aria-invalid={error}
            aria-describedby={helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {icon}
            </div>
          )}
        </div>
        {helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-xs"
            style={{
              color: error
                ? variant === "commerce"
                  ? commerceColors.semantic.error
                  : adminColors.semantic.error
                : variant === "commerce"
                ? commerceColors.text.tertiary
                : adminColors.text.tertiary,
            }}
            role="alert"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
