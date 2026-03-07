import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/features/products/api/getProductById";
import { isProductLiked } from "@/app/(commerce)/likes/actions";
import { ProductDetail } from "@/components/commerce/ProductDetail/ProductDetail";
import { ProductDetailTabs } from "./_components/ProductDetailTabs";
import { ProductReviewsSection } from "./_components/ProductReviewsSection";
import { ReviewSummarySection } from "./_components/ReviewSummarySection";
import { ReviewListSection } from "./_components/ReviewListSection";
import { ReviewSummarySkeleton } from "@/components/ui/ReviewSummarySkeleton";
import { ReviewListSkeleton } from "@/components/ui/ReviewListSkeleton";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { checkAdminAccess } from "@/lib/auth/admin";

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

  const isAdmin = await checkAdminAccess();

  const additionalInfoContent = (
    <div
      className="space-y-4 text-(--commerce-text-tertiary)"
      style={{ fontSize: 16, lineHeight: 1.625 }}
    >
      {product.description && <p>{product.description}</p>}
      {product.additional_info && (
        <div>
          <h3 className="font-medium text-(--commerce-text-primary) mb-2">
            추가 정보
          </h3>
          <p>{product.additional_info}</p>
        </div>
      )}
      {product.measurements && (
        <div>
          <h3 className="font-medium text-(--commerce-text-primary) mb-2">
            사이즈/규격
          </h3>
          <p>{product.measurements}</p>
        </div>
      )}
      {!product.description &&
        !product.additional_info &&
        !product.measurements && <p>등록된 추가 정보가 없습니다.</p>}
    </div>
  );

  const reviewsContent = (
    <ProductReviewsSection
      productId={productId}
      isAdmin={isAdmin}
      summarySlot={
        <Suspense fallback={<ReviewSummarySkeleton className="mb-6" />}>
          <ReviewSummarySection productId={productId} isAdmin={isAdmin} />
        </Suspense>
      }
      listSlot={
        <Suspense fallback={<ReviewListSkeleton />}>
          <ReviewListSection productId={productId} />
        </Suspense>
      }
    />
  );

  const initialIsLiked = await isProductLiked(productId);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} initialIsLiked={initialIsLiked} />
      <div className="mt-10">
        <ProductDetailTabs
          additionalInfoContent={additionalInfoContent}
          reviewsContent={reviewsContent}
        />
      </div>
    </div>
  );
}
