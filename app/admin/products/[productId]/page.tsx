import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getProductDetail } from "@/app/admin/queries";
import { ADMIN_URLS, getAdminOrderDetailUrl } from "@/commons/constants/url";
import { deleteProduct } from "../product-actions";

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

const cardStyle = {
  backgroundColor: "var(--admin-background-default)",
  border: "1px solid var(--admin-border-default)",
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

async function deleteAndRedirect(productId: string) {
  "use server";
  await deleteProduct(productId);
  redirect(ADMIN_URLS.PRODUCTS);
}

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requireAdminAccess();
  const { productId } = await params;
  const product = await getProductDetail(productId);
  if (!product) notFound();

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
          상품 상세
        </h1>
        <Link
          href={ADMIN_URLS.PRODUCTS}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
          style={{
            fontFamily: "var(--admin-font-public-sans)",
            fontSize: "var(--admin-text-sm)",
            color: "var(--admin-semantic-info)",
          }}
        >
          뒤로가기
        </Link>
        <Link
          href={`${ADMIN_URLS.PRODUCTS}/${product.id}/edit`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-3 py-1.5 text-sm"
          style={{
            backgroundColor: "var(--admin-primary-main)",
            color: "var(--admin-text-inverse)",
            fontFamily: "var(--admin-font-public-sans)",
          }}
        >
          수정
        </Link>
        <form action={deleteAndRedirect.bind(null, product.id)}>
          <button
            type="submit"
            className="px-3 py-1.5 rounded text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: "var(--admin-semantic-error)",
              color: "var(--admin-text-inverse)",
              fontFamily: "var(--admin-font-public-sans)",
            }}
          >
            삭제
          </button>
        </form>
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
          기본 정보
        </h2>
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          <dl
            className="grid gap-3"
            style={{ gridTemplateColumns: "auto 1fr" }}
          >
            <dt style={labelStyle}>ID</dt>
            <dd style={valueStyle}>{product.id}</dd>
            <dt style={labelStyle}>상품명</dt>
            <dd style={valueStyle}>{product.name}</dd>
            <dt style={labelStyle}>설명</dt>
            <dd style={valueStyle}>{product.description ?? "-"}</dd>
            <dt style={labelStyle}>정가</dt>
            <dd style={valueStyle}>
              {new Intl.NumberFormat("ko-KR").format(Number(product.price))}원
            </dd>
            <dt style={labelStyle}>할인가</dt>
            <dd style={valueStyle}>
              {product.sale_price !== null && product.sale_price !== undefined
                ? `${new Intl.NumberFormat("ko-KR").format(
                    Number(product.sale_price)
                  )}원`
                : "-"}
            </dd>
            <dt style={labelStyle}>상태</dt>
            <dd style={valueStyle}>{product.status}</dd>
            <dt style={labelStyle}>카테고리</dt>
            <dd style={valueStyle}>
              {product.categories?.length ? product.categories.join(", ") : "-"}
            </dd>
            <dt style={labelStyle}>등록일</dt>
            <dd style={valueStyle}>{formatDate(product.created_at)}</dd>
            <dt style={labelStyle}>수정일</dt>
            <dd style={valueStyle}>{formatDate(product.updated_at)}</dd>
          </dl>
          <div className="flex items-center justify-center">
            <div
              className="flex items-center justify-center overflow-hidden rounded border w-full max-w-sm"
              style={{
                borderColor: "var(--admin-border-default)",
                backgroundColor: "var(--admin-background-light)",
                minHeight: "220px",
              }}
            >
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="max-h-72 w-full object-contain"
                />
              ) : (
                <span
                  style={{
                    ...valueStyle,
                    color: "var(--admin-text-tertiary)",
                    fontSize: "var(--admin-text-sm)",
                  }}
                >
                  등록된 상품 이미지가 없습니다.
                </span>
              )}
            </div>
          </div>
        </div>
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
          통계 정보
        </h2>
        <dl className="grid gap-3" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt style={labelStyle}>리뷰 수</dt>
          <dd style={valueStyle}>{product.review_count}</dd>
          <dt style={labelStyle}>평균 평점</dt>
          <dd style={valueStyle}>
            {product.rating_avg !== null && product.rating_avg !== undefined
              ? product.rating_avg.toFixed(1)
              : "-"}
          </dd>
          <dt style={labelStyle}>판매 수량</dt>
          <dd style={valueStyle}>{product.sold_quantity}</dd>
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
          리뷰 목록
        </h2>
        {product.reviews.length === 0 ? (
          <p style={{ ...valueStyle, color: "var(--admin-text-tertiary)" }}>
            리뷰가 없습니다.
          </p>
        ) : (
          <ul className="list-none p-0 m-0 space-y-2">
            {product.reviews.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/reviews/${r.id}`}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded block py-1"
                  style={{
                    color: "var(--admin-semantic-info)",
                    fontFamily: "var(--admin-font-public-sans)",
                    fontSize: "var(--admin-text-sm)",
                  }}
                >
                  {r.rating}점 · {r.content?.slice(0, 40) ?? "(내용 없음)"}
                  {r.content && r.content.length > 40 ? "…" : ""} ·{" "}
                  {formatDate(r.created_at)}
                </Link>
              </li>
            ))}
          </ul>
        )}
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
          주문 내역
        </h2>
        {product.order_items.length === 0 ? (
          <p style={{ ...valueStyle, color: "var(--admin-text-tertiary)" }}>
            주문 내역이 없습니다.
          </p>
        ) : (
          <ul className="list-none p-0 m-0 space-y-2">
            {product.order_items.map((oi) => (
              <li key={oi.order_item_id}>
                <Link
                  href={getAdminOrderDetailUrl(oi.order_id)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded block py-1"
                  style={{
                    color: "var(--admin-semantic-info)",
                    fontFamily: "var(--admin-font-public-sans)",
                    fontSize: "var(--admin-text-sm)",
                  }}
                >
                  주문 {oi.order_id.slice(0, 8)}… · 수량 {oi.quantity} ·{" "}
                  {formatDate(oi.created_at)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
