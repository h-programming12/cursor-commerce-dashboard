"use client";

import Link from "next/link";
import { COMMERCE_URLS, ACCOUNT_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

// 아이콘 컴포넌트들
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 21L16.65 16.65"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 6H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M3 12H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 6H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 18H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface LayoutHeaderProps {
  cartItemCount?: number;
  onSearchClick?: () => void;
  onUserClick?: () => void;
  onCartClick?: () => void;
  className?: string;
}

export function LayoutHeader({
  cartItemCount = 0,
  onSearchClick,
  onUserClick,
  onCartClick,
  className,
}: LayoutHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-(--commerce-background-default)",
        "border-b border-(--commerce-neutral-03-100)",
        className
      )}
      style={{ height: "60px" }}
    >
      <div className="mx-auto max-w-[1440px] h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* 로고 */}
          <Link
            href={COMMERCE_URLS.HOME}
            className="flex items-center"
            aria-label="Cursor Commerce 홈으로 이동"
          >
            <span
              className="text-(--commerce-text-primary)"
              style={{
                fontFamily: "var(--commerce-font-poppins)",
                fontWeight: 500,
                fontSize: "24px",
                lineHeight: "24px",
                letterSpacing: "0",
              }}
            >
              Cursor Commerce
            </span>
          </Link>

          {/* 네비게이션 링크 그룹 (데스크톱) - 현재 비어있음 */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="주요 네비게이션"
          >
            {/* 향후 네비게이션 링크 추가 가능 */}
          </nav>

          {/* 아이콘 그룹 */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* 검색 아이콘 */}
            <button
              type="button"
              onClick={onSearchClick}
              className="p-2 text-(--commerce-text-primary) hover:text-(--commerce-neutral-07-100) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 rounded"
              aria-label="검색"
            >
              <SearchIcon />
            </button>

            {/* 사용자 아이콘 */}
            <Link
              href={ACCOUNT_URLS.ACCOUNT}
              className="p-2 text-(--commerce-text-primary) hover:text-(--commerce-neutral-07-100) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 rounded"
              aria-label="계정 페이지로 이동"
              onClick={onUserClick}
            >
              <UserIcon />
            </Link>

            {/* 장바구니 아이콘 */}
            <Link
              href={ACCOUNT_URLS.CART}
              className="relative p-2 text-(--commerce-text-primary) hover:text-(--commerce-neutral-07-100) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 rounded"
              aria-label={`장바구니로 이동${
                cartItemCount > 0 ? ` (${cartItemCount}개 상품)` : ""
              }`}
              onClick={onCartClick}
            >
              <ShoppingBagIcon />
              {cartItemCount > 0 && (
                <span
                  className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-(--commerce-neutral-07-100) text-(--commerce-text-inverse)"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "12px",
                    lineHeight: "20px",
                  }}
                  aria-label={`${cartItemCount}개 상품`}
                >
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* 모바일 햄버거 메뉴 */}
            <button
              type="button"
              className="md:hidden p-2 text-(--commerce-text-primary) hover:text-(--commerce-neutral-07-100) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 rounded"
              aria-label="메뉴 열기"
              aria-expanded="false"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
