import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getReviewDetail } from "@/app/admin/queries";
import {
  ADMIN_URLS,
  getAdminProductDetailUrl,
  getAdminUserDetailUrl,
} from "@/commons/constants/url";

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderStars(rating: number): string {
  const clamped = Math.max(1, Math.min(5, rating));
  return "★".repeat(clamped) + "☆".repeat(5 - clamped);
}

const cardStyle = {
  backgroundColor: "var(--admin-background-default)",
  border: "1px solid var(--admin-border-card)",
  borderRadius: "8px",
  padding: "var(--admin-padding-lg)",
  marginBottom: "var(--admin-margin-lg)",
};
const labelStyle = {
  fontSize: "var(--admin-text-sm)",
  lineHeight: 1.5,
  fontFamily: "var(--admin-font-public-sans)",
  color: "var(--admin-text-tertiary)",
};
const valueStyle = {
  fontSize: "var(--admin-text-md)",
  lineHeight: 1.5,
  fontFamily: "var(--admin-font-public-sans)",
  color: "var(--admin-text-primary)",
};

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  await requireAdminAccess();
  const { reviewId } = await params;
  const review = await getReviewDetail(reviewId);
  if (!review) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 flex-wrap">
        <h1
          style={{
            fontSize: "var(--admin-headline-h6-font-size)",
            lineHeight: 1.2,
            fontFamily: "var(--admin-font-poppins)",
            fontWeight: "var(--admin-font-medium)",
            color: "var(--admin-text-primary)",
          }}
        >
          리뷰 상세
        </h1>
        <Link
          href={ADMIN_URLS.REVIEWS}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
          style={{
            fontFamily: "var(--admin-font-public-sans)",
            fontSize: "var(--admin-text-sm)",
            color: "var(--admin-semantic-info)",
          }}
        >
          뒤로가기
        </Link>
      </div>

      <section style={cardStyle}>
        <h2
          style={{
            fontSize: "var(--admin-headline-h7-font-size)",
            fontFamily: "var(--admin-font-poppins)",
            fontWeight: "var(--admin-font-medium)",
            color: "var(--admin-text-primary)",
            marginBottom: "var(--admin-margin-md)",
          }}
        >
          리뷰 정보
        </h2>
        <dl className="grid gap-3" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt style={labelStyle}>리뷰 ID</dt>
          <dd style={valueStyle}>{review.id}</dd>
          <dt style={labelStyle}>평점</dt>
          <dd style={valueStyle}>
            {renderStars(review.rating)} ({review.rating})
          </dd>
          <dt style={labelStyle}>내용</dt>
          <dd style={valueStyle}>{review.content ?? "(내용 없음)"}</dd>
          <dt style={labelStyle}>작성일</dt>
          <dd style={valueStyle}>{formatDate(review.created_at)}</dd>
        </dl>
      </section>

      <section style={cardStyle}>
        <h2
          style={{
            fontSize: "var(--admin-headline-h7-font-size)",
            fontFamily: "var(--admin-font-poppins)",
            fontWeight: "var(--admin-font-medium)",
            color: "var(--admin-text-primary)",
            marginBottom: "var(--admin-margin-md)",
          }}
        >
          작성자 정보
        </h2>
        <dl className="grid gap-3" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt style={labelStyle}>유저 ID</dt>
          <dd style={valueStyle}>
            <Link
              href={getAdminUserDetailUrl(review.user_id)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: "var(--admin-semantic-info)" }}
            >
              {review.user_id}
            </Link>
          </dd>
          <dt style={labelStyle}>이메일</dt>
          <dd style={valueStyle}>{review.user_email ?? "-"}</dd>
          <dt style={labelStyle}>이름</dt>
          <dd style={valueStyle}>{review.user_display_name ?? "-"}</dd>
        </dl>
      </section>

      <section style={cardStyle}>
        <h2
          style={{
            fontSize: "var(--admin-headline-h7-font-size)",
            fontFamily: "var(--admin-font-poppins)",
            fontWeight: "var(--admin-font-medium)",
            color: "var(--admin-text-primary)",
            marginBottom: "var(--admin-margin-md)",
          }}
        >
          상품 정보
        </h2>
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          <dl
            className="grid gap-3"
            style={{ gridTemplateColumns: "auto 1fr" }}
          >
            <dt style={labelStyle}>상품 ID</dt>
            <dd style={valueStyle}>
              <Link
                href={getAdminProductDetailUrl(review.product_id)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ color: "var(--admin-semantic-info)" }}
              >
                {review.product_id}
              </Link>
            </dd>
            <dt style={labelStyle}>상품명</dt>
            <dd style={valueStyle}>{review.product_name}</dd>
          </dl>
          <div className="flex items-center justify-center">
            <div
              className="flex items-center justify-center overflow-hidden rounded border w-full max-w-sm"
              style={{
                borderColor: "var(--admin-border-default)",
                backgroundColor: "var(--admin-background-light)",
                minHeight: "180px",
              }}
            >
              {review.product_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={review.product_image_url}
                  alt={review.product_name}
                  className="max-h-64 w-full object-contain"
                />
              ) : (
                <span
                  style={{
                    ...valueStyle,
                    color: "var(--admin-text-tertiary)",
                    fontSize: "var(--admin-text-sm)",
                  }}
                >
                  상품 이미지가 없습니다.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
