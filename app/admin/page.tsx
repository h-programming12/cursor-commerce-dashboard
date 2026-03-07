import { requireAdminAccess } from "@/lib/auth/admin";

export default async function AdminDashboardPage() {
  await requireAdminAccess();
  return (
    <div>
      <h1>관리자 대시보드</h1>
      {/* 대시보드 통계 및 차트 구현 예정 */}
    </div>
  );
}
