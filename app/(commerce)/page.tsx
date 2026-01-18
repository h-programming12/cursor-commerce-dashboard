"use client";

import { useCallback } from "react";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import {
  ProductGrid,
  HomeHeroSection,
  LoadingSkeletonGrid,
} from "@/components/commerce";
import { cn } from "@/commons/utils/cn";
import { useInfiniteScroll } from "@/commons/hooks/useInfiniteScroll";
import { LoadingDots } from "@/components/ui";

export default function CommerceHomePage() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts();

  // 모든 페이지의 상품을 하나의 배열로 합치기
  const products = data?.pages.flatMap((page) => page.items) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    enabled: hasNextPage === true && isFetchingNextPage === false,
  });

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p
            className="text-lg"
            style={{ color: "var(--commerce-semantic-error)" }}
          >
            오류 발생: {error?.message || "알 수 없는 오류"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="mx-auto max-w-[1440px]"
        style={{
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: "48px",
          paddingBottom: "48px",
        }}
      >
        <h1
          className="text-4xl font-bold text-center mb-12"
          style={{ color: "var(--commerce-text-primary)" }}
        >
          All
        </h1>
        {isLoading ? (
          <LoadingSkeletonGrid
            count={12}
            columns={4}
            gap="medium"
            className={cn("w-full")}
          />
        ) : (
          <>
            <ProductGrid
              products={products}
              columns={4}
              gap="medium"
              className={cn("w-full")}
            />

            {hasNextPage && <div ref={loadMoreRef} className="h-8" />}

            {isFetchingNextPage && <LoadingDots className="mt-8" />}
          </>
        )}
      </div>
      <HomeHeroSection className="mt-12" />
    </div>
  );
}
