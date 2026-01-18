import React from "react";
import { cn } from "@/commons/utils/cn";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export interface LoadingSkeletonGridProps {
  count?: number;
  columns?: 2 | 3 | 4;
  gap?: "small" | "medium" | "large";
  className?: string;
}

const gapStyles = {
  small: "16px",
  medium: "24px",
  large: "32px",
};

const gridColumns = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export const LoadingSkeletonGrid = React.forwardRef<
  HTMLDivElement,
  LoadingSkeletonGridProps
>(({ count = 8, columns = 4, gap = "medium", className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid w-full", gridColumns[columns], className)}
      style={{
        columnGap: gapStyles[gap],
        rowGap: "48px",
      }}
      role="status"
      aria-label="Loading products"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} role="listitem">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
});

LoadingSkeletonGrid.displayName = "LoadingSkeletonGrid";
