import { requireAdminAccess } from "@/lib/auth/admin";
import { getOrdersList } from "@/app/admin/queries";
import { OrdersListClient } from "./OrdersListClient";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdminAccess();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || DEFAULT_PAGE);
  const pageSize = DEFAULT_PAGE_SIZE;
  const filters = params.status ? { status: params.status } : undefined;

  const { data, total } = await getOrdersList(page, pageSize, filters);

  return (
    <OrdersListClient
      initialData={data}
      initialTotal={total}
      initialPage={page}
      initialPageSize={pageSize}
      initialStatus={params.status ?? ""}
    />
  );
}
