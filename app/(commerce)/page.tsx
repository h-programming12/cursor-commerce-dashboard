"use client";

import { useCallback, useMemo } from "react";
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import {
  ProductGrid,
  HomeHeroSection,
  LoadingSkeletonGrid,
} from "@/components/commerce";
import { cn } from "@/commons/utils/cn";
import toast from "react-hot-toast";
import { useInfiniteScroll } from "@/commons/hooks/useInfiniteScroll";
import { LoadingDots } from "@/components/ui";
import { useCartStore } from "@/commons/store/cart-store";

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
  const products = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const addItem = useCartStore((state) => state.addItem);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAddToCart = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice ?? null,
          imageUrl: product.imageUrl || null,
        },
        1
      )
        .then(() => {
          toast.success(`${product.name}이(가) 장바구니에 추가되었습니다.`);
        })
        .catch(() => {
          toast.error("장바구니 추가 중 오류가 발생했습니다.");
        });
    },
    [products, addItem]
  );

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
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-6 py-6 md:py-8 lg:py-12">
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
              onAddToCart={handleAddToCart}
              className={cn("w-full gap-y-6 md:gap-y-8 xl:gap-y-12")}
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
