import React from "react";
import { cn } from "@/commons/utils/cn";
import { ProductCard } from "../ProductCard/ProductCard";
import { Product } from "../types";

export interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  gap?: "small" | "medium" | "large";
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
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

export const ProductGrid = React.forwardRef<HTMLDivElement, ProductGridProps>(
  (
    {
      products,
      columns = 4,
      gap = "medium",
      onAddToCart,
      onToggleWishlist,
      onProductClick,
      className,
    },
    ref
  ) => {
    if (products.length === 0) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center justify-center py-12", className)}
        >
          <p className="text-gray-500">No products found</p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("grid w-full", gridColumns[columns], className)}
        style={{
          gap: gapStyles[gap],
        }}
        role="list"
        aria-label="Product grid"
      >
        {products.map((product) => (
          <div key={product.id} role="listitem">
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              onClick={onProductClick}
            />
          </div>
        ))}
      </div>
    );
  }
);

ProductGrid.displayName = "ProductGrid";

