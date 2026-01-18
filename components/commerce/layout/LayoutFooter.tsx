"use client";

import Link from "next/link";
import { COMMERCE_URLS, ACCOUNT_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

export interface LayoutFooterProps {
  className?: string;
}

export function LayoutFooter({ className }: LayoutFooterProps) {
  return (
    <footer
      className={cn("w-full bg-(--commerce-neutral-07-100)", className)}
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1440px] px-6">
        {/* 네비게이션 링크 섹션 */}
        <nav
          className="flex flex-wrap items-center justify-center gap-6 py-12 md:gap-8"
          aria-label="Footer navigation"
        >
          <Link
            href={COMMERCE_URLS.HOME}
            className="text-(--commerce-neutral-01-100) transition-colors hover:text-(--commerce-neutral-01-95) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-01-100) focus-visible:ring-offset-2 focus-visible:ring-offset-(--commerce-neutral-07-100)"
            style={{
              fontFamily: "var(--commerce-font-inter)",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Home
          </Link>
          <Link
            href={ACCOUNT_URLS.ACCOUNT}
            className="text-(--commerce-neutral-01-100) transition-colors hover:text-(--commerce-neutral-01-95) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-01-100) focus-visible:ring-offset-2 focus-visible:ring-offset-(--commerce-neutral-07-100)"
            style={{
              fontFamily: "var(--commerce-font-inter)",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Mypage
          </Link>
          <Link
            href="/contact"
            className="text-(--commerce-neutral-01-100) transition-colors hover:text-(--commerce-neutral-01-95) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-01-100) focus-visible:ring-offset-2 focus-visible:ring-offset-(--commerce-neutral-07-100)"
            style={{
              fontFamily: "var(--commerce-font-inter)",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Contact Us
          </Link>
        </nav>

        {/* 하단 바 */}
        <div
          className="border-t border-(--commerce-neutral-04-100) py-6"
          style={{
            borderTopColor: "var(--commerce-neutral-04-100)",
          }}
        >
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* 저작권 정보 */}
            <p
              className="text-(--commerce-neutral-03-100)"
              style={{
                fontFamily: "var(--commerce-font-poppins)",
                fontSize: "12px",
                fontWeight: 400,
              }}
            >
              Copyright © 2026 Cursor Commerce. All rights reserved.
            </p>

            {/* 하단 링크 */}
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-(--commerce-neutral-01-100) transition-colors hover:text-(--commerce-neutral-01-95) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-01-100) focus-visible:ring-offset-2 focus-visible:ring-offset-(--commerce-neutral-07-100)"
                style={{
                  fontFamily: "var(--commerce-font-poppins)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-(--commerce-neutral-01-100) transition-colors hover:text-(--commerce-neutral-01-95) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-01-100) focus-visible:ring-offset-2 focus-visible:ring-offset-(--commerce-neutral-07-100)"
                style={{
                  fontFamily: "var(--commerce-font-poppins)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
