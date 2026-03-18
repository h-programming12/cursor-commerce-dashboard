import { requireAdminAccess } from "@/lib/auth/admin";
import { getReviewsList } from "@/app/admin/queries";
import { ReviewsListClient } from "./ReviewsListClient";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; rating?: string }>;
}) {
  await requireAdminAccess();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || DEFAULT_PAGE);
  const pageSize = DEFAULT_PAGE_SIZE;
  const filters = params.rating ? { rating: params.rating } : undefined;

  const { data, total } = await getReviewsList(page, pageSize, filters);

  return (
    <ReviewsListClient
      initialData={data}
      initialTotal={total}
      initialPage={page}
      initialPageSize={pageSize}
      initialRating={params.rating ?? ""}
    />
  );
}
