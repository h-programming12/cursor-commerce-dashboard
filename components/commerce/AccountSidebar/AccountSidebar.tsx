"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { AUTH_URLS, ACCOUNT_URLS, ADMIN_URLS } from "@/commons/constants/url";
import toast from "react-hot-toast";
import { FiCamera } from "react-icons/fi";
import type { Database } from "@/types/supabase";

/** 마이페이지 사이드바 md 이상 폭(px). Tailwind `md:w-[262px]`와 동일 값 유지 */
export const SIDEBAR_WIDTH_PX = 262;

export interface AccountSidebarProps {
  displayName?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  activeItem?: "account" | "orders" | "reviews" | "wishlist" | "dashboard";
  isAdmin?: boolean;
  onSignOut?: () => void;
  className?: string;
}

export function AccountSidebar({
  displayName,
  email,
  imageUrl,
  activeItem = "account",
  isAdmin,
  onSignOut,
  className,
}: AccountSidebarProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const baseMenuItems = [
    { id: "account" as const, label: "Account" },
    { id: "orders" as const, label: "Orders" },
    { id: "reviews" as const, label: "Reviews" },
    { id: "wishlist" as const, label: "Wishlist" },
  ];
  const dashboardItem = { id: "dashboard" as const, label: "Dashboard" };
  const menuItems =
    isAdmin === true ? [...baseMenuItems, dashboardItem] : baseMenuItems;

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일만 허용
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsUploading(true);

    try {
      // FileReader를 사용하여 Data URL로 변환
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          toast.error("로그인이 필요합니다.");
          return;
        }

        // public.users 테이블의 image_url 업데이트
        type UsersUpdate = Database["public"]["Tables"]["users"]["Update"];
        const updateData: UsersUpdate = {
          image_url: dataUrl,
        };

        const usersTable = supabase.from("users") as unknown as {
          update: (values: UsersUpdate) => {
            eq: (
              column: string,
              value: string
            ) => Promise<{ error: { message: string } | null }>;
          };
        };

        const { error: updateError } = await usersTable
          .update(updateData)
          .eq("id", user.id);

        if (updateError) {
          toast.error("프로필 이미지 업로드 중 오류가 발생했습니다.");
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        toast.success("프로필 이미지가 업데이트되었습니다.");
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        router.refresh();
      };

      reader.onerror = () => {
        toast.error("이미지 읽기 중 오류가 발생했습니다.");
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.readAsDataURL(file);
    } catch {
      toast.error("프로필 이미지 업로드 중 오류가 발생했습니다.");
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const displayNameText = displayName || email?.split("@")[0] || "User";

  return (
    <aside
      className={cn(
        "flex flex-col rounded-lg shrink-0 w-full md:w-[262px] md:min-w-[262px] p-4 md:py-10 md:px-4",
        className
      )}
      style={{
        backgroundColor: commerceColors.background.light,
      }}
    >
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            aria-label="프로필 이미지 업로드"
          />
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="프로필 이미지 변경"
          >
            <div
              className="rounded-full overflow-hidden"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "var(--commerce-grey-600)",
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={displayNameText}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--commerce-grey-600)",
                    color: "var(--commerce-text-inverse)",
                    fontSize: "32px",
                    fontFamily: commerceTypography.body["1"].fontFamily,
                    fontWeight: 600,
                  }}
                >
                  {displayNameText.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Camera Icon */}
            <div
              className="absolute bottom-0 right-0 flex items-center justify-center rounded-full"
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: commerceColors.neutral["07"]["100"],
                border: "2px solid var(--commerce-text-inverse)",
              }}
            >
              <FiCamera size={16} color="white" />
            </div>
          </button>
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
                  router.push(ACCOUNT_URLS.ACCOUNT);
                } else if (item.id === "orders") {
                  router.push(ACCOUNT_URLS.ORDERS);
                } else if (item.id === "reviews") {
                  router.push(ACCOUNT_URLS.REVIEWS);
                } else if (item.id === "wishlist") {
                  router.push(ACCOUNT_URLS.WISHLIST);
                } else if (item.id === "dashboard") {
                  router.push(ADMIN_URLS.DASHBOARD);
                }
              }}
              className={cn(
                "w-full text-left py-3 px-4 transition-colors cursor-pointer",
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
