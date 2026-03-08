"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/commons/utils/cn";
import { AdminMenuItem } from "../AdminMenuItem/AdminMenuItem";
import { ADMIN_URLS } from "@/commons/constants/url";
import type { AdminMenuSection } from "../types";

const MENU_ITEMS: AdminMenuSection[] = [
  {
    items: [
      { label: "대시보드", href: ADMIN_URLS.DASHBOARD },
      { label: "주문관리", href: ADMIN_URLS.ORDERS },
      { label: "상품관리", href: ADMIN_URLS.PRODUCTS },
    ],
  },
];

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
      Cursor Admin
    </span>
    <IndentDecreaseIcon />
  </div>
);

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const menuItemsWithActive = MENU_ITEMS.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      active: item.href ? pathname === item.href : false,
    })),
  }));

  return (
    <aside
      className={cn("flex shrink-0 flex-col", className)}
      style={{
        width: "260px",
        backgroundColor: "var(--admin-background-default)",
        borderRight: "1px solid var(--admin-neutral-03-100)",
      }}
    >
      {/* <div className="flex items-center px-5" style={{ height: "64px" }}>
        {defaultLogo}
      </div> */}
      <nav className="flex-1 overflow-y-auto mt-8">
        {menuItemsWithActive.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.section && (
              <div
                className="mb-2 px-5"
                style={{ paddingTop: "var(--admin-padding-md)" }}
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
}
