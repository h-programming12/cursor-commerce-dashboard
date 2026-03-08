import { requireAdminAccess } from "@/lib/auth/admin";
import { getPaymentsList } from "@/app/admin/queries";
import { PaymentsListClient } from "./PaymentsListClient";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdminAccess();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || DEFAULT_PAGE);
  const pageSize = DEFAULT_PAGE_SIZE;
  const filters = params.status ? { status: params.status } : undefined;

  const { data, total } = await getPaymentsList(page, pageSize, filters);

  return (
    <PaymentsListClient
      initialData={data}
      initialTotal={total}
      initialPage={page}
      initialPageSize={pageSize}
      initialStatus={params.status ?? ""}
    />
  );
}
