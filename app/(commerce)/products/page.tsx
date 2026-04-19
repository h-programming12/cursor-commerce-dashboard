"use client";

/**
 * `/products` 전용 목록 페이지 (홈과 동일 훅·그리드, URL만 분리).
 */
import { useInfiniteProducts } from "@/features/products/api/useInfiniteProducts";
import { ProductGrid, LoadingSkeletonGrid } from "@/components/commerce";
import { cn } from "@/commons/utils/cn";
import { Button } from "@/components/ui";

export default function ProductsPage() {
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
    <main className="w-full" aria-label="전체 상품">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-6 py-6 md:py-8 lg:py-12">
        <h1
          className="text-4xl font-bold text-center mb-12"
          style={{ color: "var(--commerce-text-primary)" }}
        >
          All Products
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
              className={cn("w-full gap-y-6 md:gap-y-8 xl:gap-y-12")}
            />

            {hasNextPage && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  style={{
                    color: "var(--commerce-text-primary)",
                    borderColor: "var(--commerce-border-default)",
                  }}
                >
                  {isFetchingNextPage ? "로딩 중..." : "더보기"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
