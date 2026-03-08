"use client";

import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { HiOutlineLogout } from "react-icons/hi";

interface AdminHeaderProps {
  email: string;
}

export function AdminHeader({ email }: AdminHeaderProps) {
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = COMMERCE_URLS.HOME;
  };

  return (
    <header
      className="flex shrink-0 items-center justify-between px-6"
      style={{
        height: "64px",
        backgroundColor: "var(--admin-background-default)",
        borderBottom: "1px solid var(--admin-neutral-03-100)",
      }}
    >
      <div className="flex items-center gap-6">
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
        <Link
          href={COMMERCE_URLS.HOME}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            fontSize: "var(--admin-text-md)",
            lineHeight: "14px",
            fontFamily: "var(--admin-font-public-sans)",
            color: "var(--admin-text-tertiary)",
          }}
        >
          Go to Commerce
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span
          style={{
            fontSize: "var(--admin-text-sm)",
            lineHeight: 1.5,
            fontFamily: "var(--admin-font-public-sans)",
            color: "var(--admin-text-secondary)",
          }}
        >
          {email}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:bg-[var(--admin-background-light)]"
          style={{
            fontSize: "var(--admin-text-sm)",
            lineHeight: 1.5,
            fontFamily: "var(--admin-font-public-sans)",
            color: "var(--admin-text-secondary)",
          }}
          aria-label="로그아웃"
        >
          <HiOutlineLogout
            style={{
              width: "var(--admin-icon-md)",
              height: "var(--admin-icon-md)",
            }}
          />
          로그아웃
        </button>
      </div>
    </header>
  );
}
