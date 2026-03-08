import { requireAdminAccess } from "@/lib/auth/admin";
import { getAdminsList } from "@/app/admin/queries";
import { AdminsListClient } from "./AdminsListClient";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export default async function AdminAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminAccess();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || DEFAULT_PAGE);
  const pageSize = DEFAULT_PAGE_SIZE;

  const { data, total } = await getAdminsList(page, pageSize);

  return (
    <AdminsListClient
      initialData={data}
      initialTotal={total}
      initialPage={page}
      initialPageSize={pageSize}
    />
  );
}
