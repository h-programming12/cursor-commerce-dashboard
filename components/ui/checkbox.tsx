"use client";

import React, { useId } from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors, adminColors } from "@/commons/constants/color";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  variant?: "commerce" | "admin";
  label?: React.ReactNode;
  error?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { variant = "commerce", label, error = false, className, id, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const colors = variant === "commerce" ? commerceColors : adminColors;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              "peer h-6 w-6 shrink-0 cursor-pointer appearance-none rounded border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "checked:bg-[#141718]! checked:border-[#141718]!",
              className
            )}
            style={{
              backgroundColor: colors.background.default,
              borderColor: error ? colors.semantic.error : colors.text.tertiary,
              borderRadius: "4px",
            }}
            aria-invalid={error}
            aria-describedby={label ? undefined : undefined}
            {...props}
          />
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100"
            aria-hidden
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="cursor-pointer text-base"
            style={{
              color: colors.text.tertiary,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 400,
              lineHeight: "26px",
            }}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
