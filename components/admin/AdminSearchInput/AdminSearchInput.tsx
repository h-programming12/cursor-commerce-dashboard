"use client";

import React from "react";
import { cn } from "@/commons/utils/cn";
import type { AdminSearchInputProps } from "../types";

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 16.5L13.5 13.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AdminSearchInput: React.FC<AdminSearchInputProps> = ({
  placeholder = "Search by order id",
  value,
  onChange,
  onSearch,
  disabled = false,
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          height: "var(--admin-input-height-md)",
          paddingLeft: "40px",
          paddingRight: "var(--admin-padding-md)",
          borderRadius: "var(--admin-radius-sm)",
          backgroundColor: "var(--admin-background-default)",
          border: "none",
          color: value
            ? "var(--admin-text-primary)"
            : "var(--admin-text-placeholder)",
          fontSize: "var(--admin-text-lg)",
          lineHeight: "21px",
          fontFamily: "var(--admin-font-public-sans)",
          fontWeight: "var(--admin-font-regular)",
        }}
        aria-label={placeholder}
        aria-disabled={disabled}
      />
    </div>
  );
};
