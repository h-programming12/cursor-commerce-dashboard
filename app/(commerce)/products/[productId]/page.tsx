export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return (
    <div>
      <h1>상품 상세 페이지</h1>
      <p>상품 ID: {productId}</p>
      {/* 상품 상세 정보 구현 예정 */}
    </div>
  );
}
