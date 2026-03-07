import { getReviewSummary, getReviewStats } from "../review-summary-actions";
import { EnhancedReviewSummary } from "./EnhancedReviewSummary";

interface ReviewSummarySectionProps {
  productId: string;
  isAdmin?: boolean;
}

export async function ReviewSummarySection({
  productId,
  isAdmin,
}: ReviewSummarySectionProps) {
  const [summary, reviewStats] = await Promise.all([
    getReviewSummary(productId),
    getReviewStats(productId),
  ]);

  return (
    <EnhancedReviewSummary
      productId={productId}
      isAdmin={isAdmin}
      initialSummary={summary}
      reviewStats={reviewStats}
    />
  );
}
