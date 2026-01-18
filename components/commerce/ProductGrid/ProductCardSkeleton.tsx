import React from "react";
import { cn } from "@/commons/utils/cn";

export interface ProductCardSkeletonProps {
  className?: string;
}

export const ProductCardSkeleton = React.forwardRef<
  HTMLDivElement,
  ProductCardSkeletonProps
>(({ className }, ref) => {
  return (
    <div ref={ref} className={cn("group relative animate-pulse", className)}>
      <div
        className="relative overflow-hidden bg-(--commerce-background-default)"
        style={{
          borderRadius: "8px",
        }}
      >
        {/* 이미지 영역 */}
        <div
          className="relative overflow-hidden bg-(--commerce-neutral-02-100)"
          style={{ height: "349px" }}
        />

        {/* 콘텐츠 영역 */}
        <div
          className="px-0 py-0"
          style={{
            height: "72px",
            paddingTop: "20px",
          }}
        >
          {/* 별점 스켈레톤 */}
          {/* <div className="mb-2" style={{ height: "16px" }}>
            <div
              className="h-4 w-20 bg-(--commerce-neutral-02-100) rounded"
              style={{ borderRadius: "4px" }}
            />
          </div> */}

          {/* 제품명 스켈레톤 */}
          <div className="mb-2 space-y-1">
            <div
              className="h-5 bg-(--commerce-neutral-02-100) rounded"
              style={{
                width: "90%",
                borderRadius: "4px",
              }}
            />
            <div
              className="h-5 bg-(--commerce-neutral-02-100) rounded"
              style={{
                width: "70%",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* 가격 스켈레톤 */}
          <div className="flex items-center gap-2">
            <div
              className="h-5 w-16 bg-(--commerce-neutral-02-100) rounded"
              style={{ borderRadius: "4px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCardSkeleton.displayName = "ProductCardSkeleton";
