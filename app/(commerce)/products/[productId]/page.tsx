import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/features/products/api/getProductById";
import { ProductDetail } from "@/components/commerce/ProductDetail/ProductDetail";
import { COMMERCE_URLS } from "@/commons/constants/url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;

  // 상품 데이터 조회
  const product = await getProductById(productId);

  // 상품이 없으면 기본 메타데이터 반환
  if (!product) {
    return {
      title: "상품을 찾을 수 없습니다 - Cursor Commerce",
      description: "요청하신 상품을 찾을 수 없습니다.",
    };
  }

  const title = `${product.name} - Cursor Commerce`;
  const description =
    product.description || `${product.name} 상품 정보를 확인하세요.`;
  const imageUrl = product.image_url || "";
  const productUrl = COMMERCE_URLS.PRODUCT_DETAIL(productId);

  return {
    title,
    description,
    keywords: [product.name, "상품", "커머스", "쇼핑"],
    openGraph: {
      title: product.name,
      description,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
      type: "website",
      url: productUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  // 상품 데이터 조회
  const product = await getProductById(productId);

  // 상품이 없거나 hidden 상태인 경우 404 페이지로 리다이렉트
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </div>
  );
}
