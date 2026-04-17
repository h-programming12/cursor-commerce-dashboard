import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getOrderDetail } from "@/app/admin/queries";
import {
  ADMIN_URLS,
  getAdminPaymentDetailUrl,
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

function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
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

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess();
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  const hasShippingInfo =
    order.receiver_name ||
    order.receiver_phone ||
    order.receiver_zipcode ||
    order.receiver_address1 ||
    order.receiver_address2;

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
          주문 상세
        </h1>
        <Link
          href={ADMIN_URLS.ORDERS}
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
          주문 정보
        </h2>
        <dl className="grid gap-3" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt style={labelStyle}>주문 ID</dt>
          <dd style={valueStyle}>{order.id}</dd>
          <dt style={labelStyle}>주문 상태</dt>
          <dd style={valueStyle}>{order.status}</dd>
          <dt style={labelStyle}>결제 상태</dt>
          <dd style={valueStyle}>{order.payment_status}</dd>
          <dt style={labelStyle}>상품 금액</dt>
          <dd style={valueStyle}>{formatAmount(order.product_total_amount)}</dd>
          <dt style={labelStyle}>배송비</dt>
          <dd style={valueStyle}>{formatAmount(order.delivery_fee)}</dd>
          <dt style={labelStyle}>할인 금액</dt>
          <dd style={valueStyle}>{formatAmount(order.discount_total)}</dd>
          <dt style={labelStyle}>총 결제 금액</dt>
          <dd style={valueStyle}>{formatAmount(order.total_amount)}</dd>
          <dt style={labelStyle}>토스 주문 ID</dt>
          <dd style={valueStyle}>{order.toss_order_id ?? "-"}</dd>
          <dt style={labelStyle}>주문일시</dt>
          <dd style={valueStyle}>{formatDate(order.created_at)}</dd>
          <dt style={labelStyle}>수정일시</dt>
          <dd style={valueStyle}>{formatDate(order.updated_at)}</dd>
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
          고객 정보
        </h2>
        <dl className="grid gap-3" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt style={labelStyle}>유저 ID</dt>
          <dd style={valueStyle}>
            <Link
              href={getAdminUserDetailUrl(order.user_id)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: "var(--admin-semantic-info)" }}
            >
              {order.user_id}
            </Link>
          </dd>
          <dt style={labelStyle}>이메일</dt>
          <dd style={valueStyle}>{order.user_email ?? "-"}</dd>
          <dt style={labelStyle}>이름</dt>
          <dd style={valueStyle}>{order.user_name ?? "-"}</dd>
          <dt style={labelStyle}>연락처</dt>
          <dd style={valueStyle}>{order.user_phone ?? "-"}</dd>
        </dl>
      </section>

      {hasShippingInfo && (
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
            배송 정보
          </h2>
          <dl
            className="grid gap-3"
            style={{ gridTemplateColumns: "auto 1fr" }}
          >
            <dt style={labelStyle}>수령인</dt>
            <dd style={valueStyle}>{order.receiver_name ?? "-"}</dd>
            <dt style={labelStyle}>연락처</dt>
            <dd style={valueStyle}>{order.receiver_phone ?? "-"}</dd>
            <dt style={labelStyle}>우편번호</dt>
            <dd style={valueStyle}>{order.receiver_zipcode ?? "-"}</dd>
            <dt style={labelStyle}>주소</dt>
            <dd style={valueStyle}>
              {[order.receiver_address1, order.receiver_address2]
                .filter(Boolean)
                .join(" ") || "-"}
            </dd>
          </dl>
        </section>
      )}

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
          주문 상품
        </h2>
        {order.items.length === 0 ? (
          <p style={{ ...valueStyle, color: "var(--admin-text-tertiary)" }}>
            주문 상품이 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--admin-background-light)",
                    height: "var(--admin-table-header-height)",
                  }}
                >
                  <th className="px-4 text-left" style={labelStyle}>
                    상품
                  </th>
                  <th className="px-4 text-right" style={labelStyle}>
                    수량
                  </th>
                  <th className="px-4 text-right" style={labelStyle}>
                    단가
                  </th>
                  <th className="px-4 text-right" style={labelStyle}>
                    할인가
                  </th>
                  <th className="px-4 text-right" style={labelStyle}>
                    소계
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      height: "var(--admin-table-row-height)",
                      borderTop: "1px solid var(--admin-border-table-cell)",
                    }}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        {item.product_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="rounded object-cover"
                            style={{ width: 32, height: 32 }}
                          />
                        ) : (
                          <div
                            className="rounded flex items-center justify-center"
                            style={{
                              width: 32,
                              height: 32,
                              backgroundColor: "var(--admin-background-light)",
                              border: "1px solid var(--admin-border-default)",
                            }}
                          >
                            <span
                              style={{
                                ...valueStyle,
                                fontSize: "var(--admin-text-xs)",
                                color: "var(--admin-text-tertiary)",
                              }}
                            >
                              -
                            </span>
                          </div>
                        )}
                        <Link
                          href={getAdminProductDetailUrl(item.product_id)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                          style={{
                            ...valueStyle,
                            color: "var(--admin-semantic-info)",
                          }}
                        >
                          {item.product_name || item.product_id}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right" style={valueStyle}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 text-right" style={valueStyle}>
                      {formatAmount(item.unit_price)}
                    </td>
                    <td className="px-4 py-2 text-right" style={valueStyle}>
                      {item.sale_price !== null && item.sale_price !== undefined
                        ? formatAmount(item.sale_price)
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-right" style={valueStyle}>
                      {formatAmount(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          결제 내역
        </h2>
        {order.payments.length === 0 ? (
          <p style={{ ...valueStyle, color: "var(--admin-text-tertiary)" }}>
            결제 내역이 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--admin-background-light)",
                    height: "var(--admin-table-header-height)",
                  }}
                >
                  <th className="px-4 text-left" style={labelStyle}>
                    결제 ID
                  </th>
                  <th className="px-4 text-left" style={labelStyle}>
                    결제 수단
                  </th>
                  <th className="px-4 text-right" style={labelStyle}>
                    금액
                  </th>
                  <th className="px-4 text-left" style={labelStyle}>
                    상태
                  </th>
                  <th className="px-4 text-left" style={labelStyle}>
                    승인일
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.payments.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      height: "var(--admin-table-row-height)",
                      borderTop: "1px solid var(--admin-border-table-cell)",
                    }}
                  >
                    <td className="px-4 py-2">
                      <Link
                        href={getAdminPaymentDetailUrl(p.id)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{
                          ...valueStyle,
                          color: "var(--admin-semantic-info)",
                        }}
                      >
                        {p.id}
                      </Link>
                    </td>
                    <td className="px-4 py-2" style={valueStyle}>
                      {p.provider} / {p.method}
                    </td>
                    <td className="px-4 py-2 text-right" style={valueStyle}>
                      {formatAmount(p.amount)}
                    </td>
                    <td className="px-4 py-2" style={valueStyle}>
                      {p.status}
                    </td>
                    <td className="px-4 py-2" style={valueStyle}>
                      {formatDate(p.approved_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
