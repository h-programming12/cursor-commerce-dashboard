"use client";

import React from "react";
import { cn } from "@/commons/utils/cn";
import { AdminMenuItem } from "../AdminMenuItem/AdminMenuItem";
import type { AdminSidebarProps } from "../types";

const IndentDecreaseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 6L3 12L9 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12H3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  logo,
  menuItems,
  className,
}) => {
  const defaultLogo = (
    <div className="flex items-center gap-2">
      <span
        style={{
          fontSize: "var(--admin-text-2xl)",
          lineHeight: "24px",
          fontFamily: "var(--admin-font-poppins)",
          fontWeight: "var(--admin-font-medium)",
          color: "var(--admin-text-primary)",
        }}
      >
        Cursor Commerce
      </span>
      <IndentDecreaseIcon />
    </div>
  );

  return (
    <aside
      className={cn("flex flex-col", className)}
      style={{
        width: "260px",
        backgroundColor: "var(--admin-background-default)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-5"
        style={{
          height: "64px",
        }}
      >
        {logo || defaultLogo}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.section && (
              <div
                className="px-5 mb-2"
                style={{
                  paddingTop: "var(--admin-padding-md)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--admin-text-xs)",
                    lineHeight: "14px",
                    fontFamily: "var(--admin-font-public-sans)",
                    fontWeight: "var(--admin-font-regular)",
                    color: "var(--admin-text-secondary)",
                    textTransform: "uppercase",
                  }}
                >
                  {section.section}
                </span>
              </div>
            )}
            <div className="px-3">
              {section.items.map((item, itemIndex) => (
                <AdminMenuItem key={itemIndex} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};
