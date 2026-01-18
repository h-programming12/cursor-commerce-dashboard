import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button } from "@/components/ui/button";
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

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
      fill={filled ? commerceColors.semantic.error : "none"}
      stroke={
        filled ? commerceColors.semantic.error : commerceColors.text.primary
      }
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, onAddToCart, onToggleWishlist, onClick, className }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isLiked, setIsLiked] = React.useState(product.isLiked ?? false);

    const handleToggleWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      onToggleWishlist?.(product.id);
    };

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
        className={cn("group relative", className)}
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
            <div
              className="relative overflow-hidden"
              style={{ height: "349px" }}
            >
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
                    className="w-full h-[46px] rounded-lg bg-(--commerce-neutral-07-100) text-(--commerce-text-inverse) transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-neutral-07-100)"
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
            <div
              className="px-0 py-0"
              style={{
                height: "72px",
                paddingTop: "20px",
              }}
            >
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
                  ${currentPrice.toFixed(2)}
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
                    ${originalPrice.toFixed(2)}
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
