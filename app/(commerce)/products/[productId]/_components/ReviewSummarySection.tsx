import { getReviewSummary } from "../review-summary-actions";
import { ReviewSummaryDisplay } from "./ReviewSummaryDisplay";
import { RegenerateSummaryButton } from "@/components/commerce/product/RegenerateSummaryButton";

interface ReviewSummarySectionProps {
  productId: string;
  isAdmin?: boolean;
}

export async function ReviewSummarySection({
  productId,
  isAdmin,
}: ReviewSummarySectionProps) {
  const summary = await getReviewSummary(productId);

  return (
    <ReviewSummaryDisplay
      productId={productId}
      initialSummary={summary}
      action={
        <RegenerateSummaryButton productId={productId} isAdmin={isAdmin} />
      }
      className="mb-6"
    />
  );
}
