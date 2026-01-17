"use client";

import React from "react";
import { cn } from "@/commons/utils/cn";
import type { AdminToggleProps } from "../types";

export const AdminToggle: React.FC<AdminToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  className,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || "Toggle"}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "relative transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          width: "var(--admin-toggle-width)",
          height: "var(--admin-toggle-height)",
          borderRadius: "var(--admin-radius-full)",
          backgroundColor: checked
            ? "var(--admin-background-toggle-on)"
            : "var(--admin-background-toggle-off)",
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 rounded-full"
          style={{
            width: "var(--admin-toggle-thumb)",
            height: "var(--admin-toggle-thumb)",
            backgroundColor: "var(--admin-background-default)",
            left: checked
              ? "calc(100% - var(--admin-toggle-thumb) - 2px)"
              : "2px",
          }}
        />
      </button>
      {label && (
        <label
          onClick={!disabled ? handleToggle : undefined}
          className={cn(
            "cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
          style={{
            fontSize: "var(--admin-text-md)",
            lineHeight: "20px",
            fontFamily: "var(--admin-font-inter)",
            fontWeight: "var(--admin-font-regular)",
            color: "var(--admin-text-label)",
          }}
        >
          {label}
        </label>
      )}
    </div>
  );
};
