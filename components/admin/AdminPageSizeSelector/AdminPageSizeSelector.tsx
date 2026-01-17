"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/commons/utils/cn";
import type { AdminPageSizeSelectorProps } from "../types";

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AdminPageSizeSelector: React.FC<AdminPageSizeSelectorProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          height: "var(--admin-input-height-sm)",
          paddingLeft: "var(--admin-padding-md)",
          paddingRight: "var(--admin-padding-md)",
          borderRadius: "var(--admin-radius-md)",
          backgroundColor: "var(--admin-background-default)",
          border: "1px solid var(--admin-border-dropdown)",
          color: "var(--admin-text-primary)",
          fontSize: "var(--admin-text-lg)",
          lineHeight: "17.625px",
          fontFamily: "var(--admin-font-public-sans)",
          fontWeight: "var(--admin-font-medium)",
          letterSpacing: "0.43px",
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Page size: ${value}`}
      >
        <span>{value}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-md shadow-lg"
          role="listbox"
          style={{
            backgroundColor: "var(--admin-background-default)",
            border: "1px solid var(--admin-border-dropdown)",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={cn(
                "w-full text-left transition-colors focus:outline-none",
                value === option && "bg-gray-50"
              )}
              role="option"
              aria-selected={value === option}
              style={{
                padding: "var(--admin-padding-md)",
                fontSize: "var(--admin-text-lg)",
                lineHeight: "17.625px",
                fontFamily: "var(--admin-font-public-sans)",
                fontWeight: "var(--admin-font-medium)",
                color:
                  value === option
                    ? "var(--admin-text-primary)"
                    : "var(--admin-text-placeholder)",
              }}
              onMouseEnter={(e) => {
                if (value !== option) {
                  e.currentTarget.style.backgroundColor =
                    "var(--admin-background-light)";
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
