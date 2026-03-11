"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiShoppingCart,
  FiUsers,
  FiFileText,
  FiPlusCircle,
  FiPackage,
  FiUser,
  FiSettings,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import { cn } from "@/commons/utils/cn";
import { ADMIN_URLS } from "@/commons/constants/url";

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

const SECTION_STYLE = {
  fontSize: "11px",
  lineHeight: "14px",
  fontFamily: "var(--admin-font-public-sans)",
  fontWeight: "var(--admin-font-regular)" as const,
  color: "#8b909a",
  textTransform: "uppercase" as const,
};

const ITEM_BASE =
  "flex items-center gap-3 rounded-md h-[40px] pl-[14px] pr-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

function SidebarLink({ href, label, icon, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        ITEM_BASE,
        active && "bg-[var(--admin-background-light)]",
        !active && "hover:bg-[var(--admin-background-light)]"
      )}
      style={{
        color: active ? "#23272e" : "#8b909a",
        fontFamily: "var(--admin-font-public-sans)",
        fontSize: "15px",
        lineHeight: "22px",
        fontWeight: active
          ? "var(--admin-font-semibold)"
          : "var(--admin-font-regular)",
      }}
      aria-current={active ? "page" : undefined}
    >
      <span className="flex shrink-0" style={{ width: 22, height: 22 }}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ADMIN_URLS.PRODUCTS) {
      return (
        pathname === ADMIN_URLS.PRODUCTS ||
        (pathname.startsWith(ADMIN_URLS.PRODUCTS + "/") &&
          !pathname.startsWith(ADMIN_URLS.NEW_PRODUCT))
      );
    }

    if (href === ADMIN_URLS.NEW_PRODUCT) {
      return (
        pathname === ADMIN_URLS.NEW_PRODUCT ||
        pathname.startsWith(ADMIN_URLS.NEW_PRODUCT + "/")
      );
    }

    return (
      pathname === href ||
      (href !== ADMIN_URLS.DASHBOARD && pathname.startsWith(href + "/"))
    );
  };

  return (
    <aside
      className={cn("flex shrink-0 flex-col", className)}
      style={{
        width: "260px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid var(--admin-neutral-03-100)",
      }}
    >
      <nav className="flex-1 overflow-y-auto px-3 pt-4">
        <div className="mb-4">
          <div className="mb-2 pl-3" style={SECTION_STYLE}>
            MAIN MENU
          </div>
          <div className="flex flex-col gap-1">
            <SidebarLink
              href={ADMIN_URLS.DASHBOARD}
              label="Dashboard"
              icon={<FiHome size={22} style={{ color: "inherit" }} />}
              active={isActive(ADMIN_URLS.DASHBOARD)}
            />
            <SidebarLink
              href={ADMIN_URLS.ORDERS}
              label="Order Management"
              icon={<FiShoppingCart size={22} style={{ color: "inherit" }} />}
              active={isActive(ADMIN_URLS.ORDERS)}
            />
            <SidebarLink
              href={ADMIN_URLS.USERS}
              label="Customers"
              icon={<FiUsers size={22} style={{ color: "inherit" }} />}
              active={isActive(ADMIN_URLS.USERS)}
            />
            <SidebarLink
              href={ADMIN_URLS.PAYMENTS}
              label="Transaction"
              icon={<FiFileText size={22} style={{ color: "inherit" }} />}
              active={isActive(ADMIN_URLS.PAYMENTS)}
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 pl-3" style={SECTION_STYLE}>
            PRODUCTS
          </div>
          <div className="flex flex-col gap-1">
            <SidebarLink
              href={ADMIN_URLS.NEW_PRODUCT}
              label="Add Products"
              icon={<FiPlusCircle size={22} style={{ color: "inherit" }} />}
              active={isActive(ADMIN_URLS.NEW_PRODUCT)}
            />
            <SidebarLink
              href={ADMIN_URLS.PRODUCTS}
              label="Product List"
              icon={<FiPackage size={22} style={{ color: "inherit" }} />}
              active={isActive(ADMIN_URLS.PRODUCTS)}
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 pl-3" style={SECTION_STYLE}>
            ADMIN
          </div>
          <div className="flex flex-col gap-1">
            <SidebarLink
              href={ADMIN_URLS.ADMINS}
              label="Manage Admins"
              icon={<FiUser size={22} style={{ color: "inherit" }} />}
              active={isActive(ADMIN_URLS.ADMINS)}
            />
            <SidebarLink
              href={ADMIN_URLS.DASHBOARD}
              label="Settings"
              icon={<FiSettings size={22} style={{ color: "inherit" }} />}
              active={false}
            />
          </div>
        </div>
      </nav>
    </aside>
  );
}
