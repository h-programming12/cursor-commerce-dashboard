"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { AUTH_URLS } from "@/commons/constants/url";

export interface AccountSidebarProps {
  displayName?: string | null;
  email?: string | null;
  activeItem?: "account" | "orders" | "reviews" | "wishlist" | "dashboard";
  onSignOut?: () => void;
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
      d="M8 10.6667C9.47276 10.6667 10.6667 9.47276 10.6667 8C10.6667 6.52724 9.47276 5.33333 8 5.33333C6.52724 5.33333 5.33333 6.52724 5.33333 8C5.33333 9.47276 6.52724 10.6667 8 10.6667Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.66667 5.33333H4L4.66667 3.33333H7.33333L8 5.33333H13.3333C13.5101 5.33333 13.6797 5.40357 13.8047 5.5286C13.9298 5.65362 14 5.82319 14 6V12.6667C14 12.8435 13.9298 13.0131 13.8047 13.1381C13.6797 13.2631 13.5101 13.3333 13.3333 13.3333H2.66667C2.48986 13.3333 2.32029 13.2631 2.19526 13.1381C2.07024 13.0131 2 12.8435 2 12.6667V6C2 5.82319 2.07024 5.65362 2.19526 5.5286C2.32029 5.40357 2.48986 5.33333 2.66667 5.33333Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function AccountSidebar({
  displayName,
  email,
  activeItem = "account",
  onSignOut,
  className,
}: AccountSidebarProps) {
  const router = useRouter();

  const menuItems = [
    { id: "account" as const, label: "Account" },
    { id: "orders" as const, label: "Orders" },
    { id: "reviews" as const, label: "Reviews" },
    { id: "wishlist" as const, label: "Wishlist" },
    { id: "dashboard" as const, label: "Dashboard" },
  ];

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push(AUTH_URLS.LOGIN);
      router.refresh();
    }
  };

  const displayNameText = displayName || email?.split("@")[0] || "User";

  return (
    <aside
      className={cn("flex flex-col rounded-lg", className)}
      style={{
        width: "262px",
        backgroundColor: commerceColors.background.light,
        padding: "40px 52px",
      }}
    >
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#121212",
            }}
          >
            {/* Avatar placeholder - 실제로는 이미지나 이니셜 표시 */}
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                backgroundColor: "#121212",
                color: "#ffffff",
                fontSize: "32px",
                fontFamily: commerceTypography.body["1"].fontFamily,
                fontWeight: 600,
              }}
            >
              {displayNameText.charAt(0).toUpperCase()}
            </div>
          </div>
          {/* Camera Icon */}
          <div
            className="absolute bottom-0 right-0 flex items-center justify-center rounded-full"
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: commerceColors.neutral["07"]["100"],
              border: "2px solid #ffffff",
            }}
          >
            <CameraIcon />
          </div>
        </div>
        <h3
          style={{
            fontSize: "20px",
            lineHeight: "32px",
            fontFamily: commerceTypography.body["1"].fontFamily,
            fontWeight: 600,
            color: commerceColors.text.primary,
          }}
        >
          {displayNameText}
        </h3>
      </div>

      {/* Menu Items */}
      <nav className="flex-1">
        {menuItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "account") {
                  router.push("/account");
                }
                // 다른 메뉴 아이템은 나중에 구현
              }}
              className={cn(
                "w-full text-left py-3 px-4 rounded transition-colors",
                isActive && "border-l-2"
              )}
              style={{
                borderLeftColor: isActive
                  ? commerceColors.neutral["07"]["100"]
                  : "transparent",
                color: isActive
                  ? commerceColors.neutral["07"]["100"]
                  : commerceColors.text.tertiary,
                fontSize: "16px",
                lineHeight: "26px",
                fontFamily: commerceTypography.body["2"].fontFamily,
                fontWeight: 600,
              }}
            >
              {item.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full text-left py-3 px-4 rounded transition-colors"
          style={{
            color: commerceColors.text.tertiary,
            fontSize: "16px",
            lineHeight: "26px",
            fontFamily: commerceTypography.body["2"].fontFamily,
            fontWeight: 600,
          }}
        >
          Log Out
        </button>
      </nav>
    </aside>
  );
}
