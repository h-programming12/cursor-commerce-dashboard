import { requireAdminAccess } from "@/lib/auth/admin";
import { getProductDetail } from "@/app/admin/queries";
import { notFound } from "next/navigation";
import { ProductForm } from "../../ProductForm";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requireAdminAccess();
  const { productId } = await params;
  const product = await getProductDetail(productId);

  if (!product) {
    notFound();
  }

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
        상품 수정
      </h1>
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
