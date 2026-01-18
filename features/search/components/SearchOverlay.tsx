"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/commons/utils/cn";
import { useSearchStore } from "../store/searchStore";
import { useProductSearch } from "../api/useProductSearch";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import { ProductGrid } from "@/components/commerce/ProductGrid/ProductGrid";
import { LoadingSkeletonGrid } from "@/components/commerce/ProductGrid/LoadingSkeletonGrid";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button } from "@/components/ui/button";

// 아이콘 컴포넌트
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
      d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HEADER_HEIGHT = 60;

export function SearchOverlay() {
  const { isOpen, keyword, setKeyword, close } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchResults = useProductSearch(keyword);
  const infiniteProducts = useInfiniteProducts();

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // 검색바가 열릴 때 입력 필드에 포커스
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, close]);

  // body 스크롤 잠금 (스크롤바 너비만큼 padding 추가하여 레이아웃 시프트 방지)
  useEffect(() => {
    if (isOpen) {
      // 스크롤바 너비 계산
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // body 스크롤 잠금 및 padding 추가
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      // 스크롤 잠금 해제 및 padding 제거
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // 검색 결과 결정
  const hasKeyword = keyword.trim().length > 0;
  const products = hasKeyword
    ? searchResults.data ?? []
    : infiniteProducts.data?.pages.flatMap((page) => page.items) ?? [];
  const isLoading = hasKeyword
    ? searchResults.isLoading
    : infiniteProducts.isLoading;
  const isError = hasKeyword ? searchResults.isError : infiniteProducts.isError;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed left-0 right-0 bottom-0 z-100",
        "transition-all duration-200 ease-out",
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      )}
      style={{
        top: `${HEADER_HEIGHT}px`,
        backgroundColor: commerceColors.background.default,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="검색"
      onClick={(e) => {
        // 오버레이 배경 클릭 시 닫기 (컨테이너 클릭은 stopPropagation으로 막힘)
        if (e.target === e.currentTarget) {
          close();
        }
      }}
    >
      {/* 컨테이너 */}
      <div
        className="mx-auto max-w-[1440px] h-full flex flex-col relative z-10"
        onClick={(e) => {
          // 컨테이너 내부 클릭은 이벤트 전파 중지
          e.stopPropagation();
        }}
      >
        {/* 상단 검색바 */}
        <div
          className="px-4 sm:px-6 lg:px-8 py-4"
          style={{
            minHeight: "112px",
            backgroundColor: commerceColors.background.default,
          }}
        >
          {/* 검색 입력 필드 컨테이너 */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border transition-colors focus-within:ring-2 focus-within:ring-offset-2"
            )}
            style={{
              height: "72px",
              paddingLeft: "24px",
              paddingRight: "16px",
              backgroundColor: commerceColors.background.paper,
              borderColor: "#e8ecef",
              borderRadius: "16px",
            }}
          >
            <div className="flex items-center" style={{ color: "#99a1af" }}>
              <SearchIcon />
            </div>
            <input
              ref={inputRef}
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  close();
                }
              }}
              className="flex-1 bg-transparent border-0 outline-none focus:outline-none"
              style={{
                fontSize: `${commerceTypography.body["2"].fontSize}px`,
                lineHeight: "26px",
                fontFamily: commerceTypography.body["2"].fontFamily,
                fontWeight: commerceTypography.body["2"].fontWeight,
                color: commerceColors.text.primary,
              }}
              placeholder="Search for products..."
              aria-label="검색어 입력"
            />
            {/* Search 버튼 */}
            <Button
              onClick={() => {
                // 검색 실행 (필요시 추가 로직)
              }}
              pill
              style={{
                height: "40px",
                paddingLeft: "24px",
                paddingRight: "24px",
                backgroundColor: commerceColors.neutral["07"]["100"],
                color: commerceColors.text.inverse,
                borderRadius: "80px",
              }}
              aria-label="검색 실행"
            >
              <span
                style={{
                  fontFamily: commerceTypography.button.m.fontFamily,
                  fontSize: `${commerceTypography.button.m.fontSize}px`,
                  lineHeight: "28px",
                  fontWeight: commerceTypography.button.m.fontWeight,
                  letterSpacing: "-0.4px",
                }}
              >
                Search
              </span>
            </Button>
          </div>
        </div>

        {/* 검색 결과 영역 */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-6 py-8">
          {isLoading ? (
            <LoadingSkeletonGrid count={8} columns={4} gap="medium" />
          ) : isError ? (
            <div className="flex items-center justify-center py-12">
              <p style={{ color: commerceColors.text.tertiary }}>
                검색 중 오류가 발생했습니다.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p style={{ color: commerceColors.text.tertiary }}>
                {hasKeyword ? "검색 결과가 없습니다." : "상품이 없습니다."}
              </p>
            </div>
          ) : (
            <ProductGrid products={products} columns={4} gap="medium" />
          )}
        </div>
      </div>
    </div>
  );
}
