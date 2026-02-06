"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, ADMIN_URLS, AUTH_URLS } from "@/commons/constants/url";
import { createClient } from "@/lib/supabase/browser";

export interface AccountSidebarProps {
  displayName: string | null;
  email: string;
  className?: string;
}

const CameraIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 6.5L12.5 5.5C12.2239 5.22386 11.7761 5.22386 11.5 5.5L10.5 6.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 4C2 3.44772 2.44772 3 3 3H5.5C5.77614 3 6 2.77614 6 2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5C10 2.77614 10.2239 3 10.5 3H13C13.5523 3 14 3.44772 14 4V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="80" height="80" rx="40" fill="#121212" />
    <circle cx="40" cy="28" r="8" fill="white" />
    <path
      d="M24 60C24 52 32 48 40 48C48 48 56 52 56 60"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

interface MenuItem {
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  displayName,
  email,
  className,
}) => {
  const router = useRouter();

  const handleLogOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(AUTH_URLS.LOGIN);
    router.refresh();
  };

  const menuItems: MenuItem[] = [
    {
      label: "Account",
      href: ACCOUNT_URLS.ACCOUNT,
      isActive: true,
    },
    {
      label: "Orders",
      href: "#",
    },
    {
      label: "Reviews",
      href: "#",
    },
    {
      label: "Wishlist",
      href: "#",
    },
    {
      label: "Dashboard",
      href: ADMIN_URLS.DASHBOARD,
    },
    {
      label: "Log Out",
      href: "#",
      onClick: handleLogOut,
    },
  ];

  return (
    <aside
      className={cn("flex flex-col rounded-lg", className)}
      style={{
        width: "262px",
        backgroundColor: commerceColors.background.light,
        borderRadius: "8px",
        padding: "40px 16px",
      }}
    >
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="relative mb-4"
          style={{ width: "82px", height: "82px" }}
        >
          <div
            className="rounded-full overflow-hidden flex items-center justify-center"
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: commerceColors.neutral["07"]["100"],
            }}
          >
            <UserIcon />
          </div>
        </div>
        <h3
          style={{
            fontSize: commerceTypography.body["1-semi"].fontSize,
            lineHeight: "32px",
            fontFamily: commerceTypography.body["1-semi"].fontFamily,
            fontWeight: commerceTypography.body["1-semi"].fontWeight,
            color: commerceColors.text.primary,
            textAlign: "center",
          }}
        >
          {displayName || email.split("@")[0]}
        </h3>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col">
        {menuItems.map((item, index) => {
          const isActive = item.isActive;
          const content = (
            <div
              className={cn(
                "px-4 py-3 transition-colors cursor-pointer",
                isActive ? "border-l-2" : ""
              )}
              style={{
                borderLeftColor: isActive
                  ? commerceColors.neutral["07"]["100"]
                  : "transparent",
                borderLeftWidth: isActive ? "2px" : "0px",
                height: "42px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: commerceTypography.body["2-semi"].fontSize,
                  lineHeight: "26px",
                  fontFamily: commerceTypography.body["2-semi"].fontFamily,
                  fontWeight: commerceTypography.body["2-semi"].fontWeight,
                  color: isActive
                    ? commerceColors.neutral["07"]["100"]
                    : commerceColors.text.tertiary,
                }}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={index}
                type="button"
                onClick={item.onClick}
                className="w-full text-left"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className="w-full"
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
