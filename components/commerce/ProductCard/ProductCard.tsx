import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/commons/utils/cn";
import { formatPrice } from "@/commons/utils/formatPrice";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "../RatingStars/RatingStars";
import { Product } from "../types";
import { COMMERCE_URLS } from "@/commons/constants/url";

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onClick?: (productId: string) => void;
  className?: string;
}

export const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, onAddToCart, onClick, className }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToCart?.(product.id);
    };

    const handleCardClick = () => {
      onClick?.(product.id);
    };

    const productUrl = COMMERCE_URLS.PRODUCT_DETAIL(product.id);

    // 가격 계산: salePrice가 있으면 할인가가 현재가, price가 원가
    const currentPrice = product.salePrice ?? product.price;
    const originalPrice = product.salePrice ? product.price : undefined;
    const hasDiscount = product.salePrice && product.salePrice < product.price;

    return (
      <div
        ref={ref}
        className={cn(
          "group relative w-full max-w-[420px] md:max-w-none mx-auto",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={productUrl} onClick={handleCardClick}>
          <div
            className="relative overflow-hidden bg-(--commerce-background-default) transition-all"
            style={{
              borderRadius: "8px",
            }}
          >
            {/* 이미지 영역 */}
            <div className="relative overflow-hidden aspect-4/5">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />

              {/* 배지 */}
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {product.badges.map((badge, index) => (
                    <Badge key={index} variant={badge.variant}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}

              {/* 위시리스트 버튼 */}
              {/* <button
                type="button"
                onClick={handleToggleWishlist}
                className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-full bg-(--commerce-background-default) transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-neutral-07-100)"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "32px",
                }}
                aria-label={
                  isLiked ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <HeartIcon filled={isLiked} />
              </button> */}

              {/* Hover 시 Add to cart 버튼 */}
              {isHovered && (
                <div
                  className="absolute bottom-4 left-4 right-4 z-10"
                  style={{
                    width: "80%",
                    margin: "0 auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="cursor-pointer w-full h-[46px] rounded-lg bg-(--commerce-neutral-07-100) text-(--commerce-text-inverse) transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-neutral-07-100)"
                    style={{
                      fontFamily: "var(--commerce-font-inter)",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "28px",
                      letterSpacing: "-0.4px",
                    }}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    Add to cart
                  </button>
                </div>
              )}
            </div>

            {/* 콘텐츠 영역 */}
            <div className="px-0 py-0 pt-5 min-h-[72px]">
              {/* 별점 */}
              {product.rating !== undefined && (
                <div className="mb-2" style={{ height: "16px" }}>
                  <RatingStars
                    rating={product.rating}
                    size="small"
                    showRating={false}
                    interactive={false}
                  />
                </div>
              )}

              {/* 제품명 */}
              <h3
                className="mb-2 line-clamp-2"
                style={{
                  fontSize: "16px",
                  lineHeight: "26px",
                  fontFamily: "var(--commerce-font-inter)",
                  fontWeight: 600,
                  color: "var(--commerce-text-primary)",
                }}
              >
                {product.name}
              </h3>

              {/* 가격 */}
              <div className="flex items-center gap-2">
                {/* 현재가 (할인가 또는 정가) */}
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "22px",
                    fontFamily: "var(--commerce-font-inter)",
                    fontWeight: 600,
                    color: "var(--commerce-text-primary)",
                  }}
                >
                  {formatPrice(Math.round(currentPrice))}
                </span>
                {/* 원가 (할인이 있을 때만 표시) */}
                {hasDiscount && originalPrice && (
                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: "22px",
                      fontFamily: "var(--commerce-font-inter)",
                      fontWeight: 400,
                      color: "var(--commerce-text-tertiary)",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatPrice(Math.round(originalPrice))}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";
