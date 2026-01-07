"use client";

import { useProductsQuery } from "@/features/products/api/useProductsQuery";

export default function CommerceHomePage() {
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useProductsQuery({
    limit: 10,
  });

  if (isLoading) {
    return (
      <div>
        <h1>커머스 홈 페이지</h1>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1>커머스 홈 페이지</h1>
        <p>오류 발생: {error?.message || "알 수 없는 오류"}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>커머스 홈 페이지</h1>
      <div>
        <h2>상품 데이터 (JSON)</h2>
        <pre style={{ padding: "1rem", overflow: "auto" }}>
          {JSON.stringify(products ?? [], null, 2)}
        </pre>
      </div>
    </div>
  );
}
