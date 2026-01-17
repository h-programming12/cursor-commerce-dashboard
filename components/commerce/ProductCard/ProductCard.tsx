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

    return (
      <div
        ref={ref}
        className={cn("group relative", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={productUrl} onClick={handleCardClick}>
          <div
            className="relative overflow-hidden rounded-lg bg-white transition-all hover:shadow-lg"
            style={{
              border: `1px solid ${commerceColors.neutral["03"]["100"]}`,
              borderRadius: "8px",
            }}
          >
            {/* 이미지 영역 */}
            <div className="relative" style={{ height: "349px" }}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* 배지 */}
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.badges.map((badge, index) => (
                    <Badge key={index} variant={badge.variant}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}

              {/* 위시리스트 버튼 */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className="absolute top-4 right-4 flex items-center justify-center rounded-full bg-white transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141718]"
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
              </button>

              {/* Hover 시 Add to cart 버튼 */}
              {isHovered && (
                <div
                  className="absolute bottom-4 left-4 right-4 animate-in fade-in slide-in-from-bottom-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleAddToCart}
                    className="w-full"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    Add to cart
                  </Button>
                </div>
              )}
            </div>

            {/* 콘텐츠 영역 */}
            <div className="p-4">
              {/* 별점 */}
              {product.rating !== undefined && (
                <div className="mb-2">
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
                  fontSize: `${commerceTypography.body["2-semi"].fontSize}px`,
                  lineHeight: `${commerceTypography.body["2-semi"].lineHeight}px`,
                  fontFamily: commerceTypography.body["2-semi"].fontFamily,
                  fontWeight: commerceTypography.body["2-semi"].fontWeight,
                  color: commerceColors.text.primary,
                }}
              >
                {product.name}
              </h3>

              {/* 가격 */}
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: `${commerceTypography.caption["1-semi"].fontSize}px`,
                    lineHeight: `${commerceTypography.caption["1-semi"].lineHeight}px`,
                    fontFamily: commerceTypography.caption["1-semi"].fontFamily,
                    fontWeight: commerceTypography.caption["1-semi"].fontWeight,
                    color: commerceColors.text.primary,
                  }}
                >
                  ${product.price.toFixed(2)}
                </span>
                {product.salePrice && product.salePrice < product.price && (
                  <span
                    style={{
                      fontSize: `${commerceTypography.caption["1"].fontSize}px`,
                      lineHeight: `${commerceTypography.caption["1"].lineHeight}px`,
                      fontFamily: commerceTypography.caption["1"].fontFamily,
                      fontWeight: commerceTypography.caption["1"].fontWeight,
                      color: commerceColors.text.tertiary,
                      textDecoration: "line-through",
                    }}
                  >
                    ${product.salePrice.toFixed(2)}
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
