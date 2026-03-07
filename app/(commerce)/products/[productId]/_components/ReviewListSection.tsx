import { getProductReviewsFirstPage } from "../review-list-server";
import { ReviewList } from "./ReviewList";

interface ReviewListSectionProps {
  productId: string;
}

export async function ReviewListSection({ productId }: ReviewListSectionProps) {
  const { reviews, hasNextPage, totalCount } = await getProductReviewsFirstPage(
    productId
  );

  return (
    <ReviewList
      productId={productId}
      reviewCount={totalCount}
      initialPage={{ reviews, hasNextPage, totalCount }}
    />
  );
}
