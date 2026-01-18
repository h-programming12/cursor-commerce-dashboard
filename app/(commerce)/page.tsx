"use client";

import { useProductsQuery } from "@/features/products/api/useProductsQuery";
import { ProductGrid, HomeHeroSection } from "@/components/commerce";
import { cn } from "@/commons/utils/cn";

export default function CommerceHomePage() {
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useProductsQuery({
    limit: 12,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-(--commerce-text-tertiary)">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-(--commerce-semantic-error)">
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
        <ProductGrid
          products={products ?? []}
          columns={4}
          gap="medium"
          className={cn("w-full")}
        />
      </div>
      <HomeHeroSection className="mt-12" />
    </div>
  );
}
