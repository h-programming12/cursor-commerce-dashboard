import { requireAdminAccess } from "@/lib/auth/admin";
import { ProductForm } from "../ProductForm";

export default async function AdminNewProductPage() {
  await requireAdminAccess();

  return (
    <div className="space-y-6">
      <h1
        style={{
          fontSize: "var(--admin-headline-h6-font-size)",
          lineHeight: 1.2,
          fontFamily: "var(--admin-font-poppins)",
          fontWeight: "var(--admin-font-medium)",
          color: "var(--admin-text-primary)",
        }}
      >
        상품 등록
      </h1>
      <ProductForm mode="create" />
    </div>
  );
}
