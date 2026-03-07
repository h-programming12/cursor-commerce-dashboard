import { requireAdminAccess } from "@/lib/auth/admin";

export default async function AdminProductsPage() {
  await requireAdminAccess();
  return (
    <div>
      <h1>관리자 상품 관리 페이지</h1>
      {/* 상품 CRUD 구현 예정 */}
    </div>
  );
}
