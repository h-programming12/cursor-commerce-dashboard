import { requireAdminAccess } from "@/lib/auth/admin";
import { getProductsList } from "@/app/admin/queries";
import type { ProductListStatusFilter } from "@/app/admin/queries";
import { ProductsListClient } from "./ProductsListClient";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
    category?: string;
  }>;
}) {
  await requireAdminAccess();
  const params = await searchParams;
  const page = Math.max(
    1,
    parseInt(params.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE
  );
  const pageSize = DEFAULT_PAGE_SIZE;
  const search = params.search?.trim() ?? undefined;
  const sortBy = params.sortBy ?? "created_at";
  const sortOrder =
    params.sortOrder === "asc" || params.sortOrder === "desc"
      ? params.sortOrder
      : "desc";
  const status = (
    ["registered", "hidden", "sold_out"].includes(params.status ?? "")
      ? params.status
      : "all"
  ) as ProductListStatusFilter;
  const category = params.category?.trim() ?? undefined;

  const { data, total } = await getProductsList({
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    status,
    category,
  });

  return (
    <ProductsListClient
      initialData={data}
      initialTotal={total}
      initialPage={page}
      initialPageSize={pageSize}
      initialSearch={params.search ?? ""}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      initialStatus={status}
      initialCategory={params.category ?? ""}
    />
  );
}
