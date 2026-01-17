"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/commons/utils/cn";
import type { AdminMenuItemData } from "../types";

const ChevronRightIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.75 13.5L11.25 9L6.75 4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.5 6.75L9 11.25L13.5 6.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface AdminMenuItemComponentProps extends AdminMenuItemData {
  className?: string;
}

export const AdminMenuItem: React.FC<AdminMenuItemComponentProps> = ({
  icon,
  label,
  href,
  active = false,
  badge,
  hasSubmenu = false,
  onClick,
  className,
}) => {
  const content = (
    <>
      {icon && (
        <div
          className="flex items-center justify-center"
          style={{
            width: "var(--admin-icon-md)",
            height: "var(--admin-icon-md)",
          }}
        >
          {icon}
        </div>
      )}
      <span
        style={{
          fontSize: "var(--admin-text-lg)",
          lineHeight: "22px",
          fontFamily: "var(--admin-font-public-sans)",
          fontWeight: active
            ? "var(--admin-font-semibold)"
            : "var(--admin-font-regular)",
          color: active
            ? "var(--admin-text-primary)"
            : "var(--admin-text-secondary)",
        }}
      >
        {label}
      </span>
      {badge !== undefined && (
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: "22px",
            height: "22px",
            backgroundColor: "rgba(115, 103, 240, 0.16)",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: "var(--admin-font-medium)",
              color: "var(--admin-status-badge)",
            }}
          >
            {badge}
          </span>
        </div>
      )}
      {hasSubmenu && (
        <div className="ml-auto">
          {active ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </div>
      )}
    </>
  );

  const baseStyles = cn(
    "flex items-center gap-3 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    active && "bg-[var(--admin-background-light)]",
    !active && "hover:bg-[var(--admin-background-light)]",
    className
  );

  const itemStyles = {
    height: "40px",
    paddingLeft: "var(--admin-padding-md)",
    paddingRight: "var(--admin-padding-md)",
  };

  if (href) {
    return (
      <Link
        href={href}
        className={baseStyles}
        style={itemStyles}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseStyles}
      style={itemStyles}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </button>
  );
};
