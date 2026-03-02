import { ReviewCard } from "@/components/commerce/ReviewCard/ReviewCard";
import { COMMERCE_URLS } from "@/commons/constants/url";
import type { Review } from "@/components/commerce/types";

export interface MyReviewItem {
  review: Review;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
}

export interface MyReviewListItemProps {
  item: MyReviewItem;
  currentUserId: string;
}

export function MyReviewListItem({
  item,
  currentUserId,
}: MyReviewListItemProps) {
  const { review, product } = item;

  return (
    <ReviewCard
      review={review}
      productId={product?.id}
      currentUserId={currentUserId}
      productLinkHref={
        product ? COMMERCE_URLS.PRODUCT_DETAIL(product.id) : undefined
      }
      productLinkLabel={product?.name}
    />
  );
}
