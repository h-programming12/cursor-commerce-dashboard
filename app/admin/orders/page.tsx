import { requireAdminAccess } from "@/lib/auth/admin";

export default async function AdminOrdersPage() {
  await requireAdminAccess();
  return (
    <div>
      <h1>관리자 주문 관리 페이지</h1>
      {/* 주문 목록 및 관리 구현 예정 */}
    </div>
  );
}
