import { requireAdminAccess } from "@/lib/auth/admin";
import { getUsersList } from "@/app/admin/queries";
import type { UserListRoleFilter } from "@/app/admin/queries";
import { UsersListClient } from "./UsersListClient";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string }>;
}) {
  await requireAdminAccess();
  const params = await searchParams;
  const page = Math.max(
    1,
    parseInt(params.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE
  );
  const pageSize = DEFAULT_PAGE_SIZE;
  const role = (
    params.role === "user" || params.role === "admin" ? params.role : "all"
  ) as UserListRoleFilter;

  const { data, total } = await getUsersList(page, pageSize, role);

  return (
    <UsersListClient
      initialData={data}
      initialTotal={total}
      initialPage={page}
      initialPageSize={pageSize}
      initialRole={role}
    />
  );
}
