import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getPaymentDetail } from "@/app/admin/queries";
import {
  getAdminOrderDetailUrl,
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

function formatAmount(amount: number): string {
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

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  await requireAdminAccess();
  const { paymentId } = await params;
  const payment = await getPaymentDetail(paymentId);
  if (!payment) notFound();

  return (
    <div className="space-y-8">
      <h1
        style={{
          fontSize: "var(--admin-headline-h6-font-size)",
          lineHeight: 1.2,
          fontFamily: "var(--admin-font-poppins)",
          fontWeight: "var(--admin-font-medium)",
          color: "var(--admin-text-primary)",
        }}
      >
        결제 상세
      </h1>

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
          결제 정보
        </h2>
        <dl className="grid gap-3" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt style={labelStyle}>결제 ID</dt>
          <dd style={valueStyle}>{payment.id}</dd>
          <dt style={labelStyle}>주문 ID</dt>
          <dd style={valueStyle}>
            <Link
              href={getAdminOrderDetailUrl(payment.order_id)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: "var(--admin-semantic-info)" }}
            >
              {payment.order_id}
            </Link>
          </dd>
          <dt style={labelStyle}>유저 ID</dt>
          <dd style={valueStyle}>
            <Link
              href={getAdminUserDetailUrl(payment.user_id)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: "var(--admin-semantic-info)" }}
            >
              {payment.user_id}
            </Link>
          </dd>
          <dt style={labelStyle}>이메일</dt>
          <dd style={valueStyle}>{payment.user_email ?? "-"}</dd>
          <dt style={labelStyle}>상태</dt>
          <dd style={valueStyle}>{payment.status}</dd>
          <dt style={labelStyle}>금액</dt>
          <dd style={valueStyle}>
            {formatAmount(payment.amount)} {payment.currency}
          </dd>
          <dt style={labelStyle}>결제 수단</dt>
          <dd style={valueStyle}>
            {payment.provider} / {payment.method}
          </dd>
          <dt style={labelStyle}>거래 ID</dt>
          <dd style={valueStyle}>{payment.transaction_id ?? "-"}</dd>
          <dt style={labelStyle}>생성일</dt>
          <dd style={valueStyle}>{formatDate(payment.created_at)}</dd>
          <dt style={labelStyle}>승인일</dt>
          <dd style={valueStyle}>{formatDate(payment.approved_at)}</dd>
        </dl>
      </section>

      {(payment.order_status !== null ||
        payment.order_status !== undefined ||
        payment.order_total_amount !== null ||
        payment.order_total_amount !== undefined) && (
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
            연관 주문
          </h2>
          <dl
            className="grid gap-3"
            style={{ gridTemplateColumns: "auto 1fr" }}
          >
            {payment.order_status !== null &&
              payment.order_status !== undefined && (
                <>
                  <dt style={labelStyle}>주문 상태</dt>
                  <dd style={valueStyle}>{payment.order_status}</dd>
                </>
              )}
            {payment.order_total_amount !== null &&
              payment.order_total_amount !== undefined && (
                <>
                  <dt style={labelStyle}>주문 금액</dt>
                  <dd style={valueStyle}>
                    {formatAmount(payment.order_total_amount)}
                  </dd>
                </>
              )}
          </dl>
        </section>
      )}
    </div>
  );
}
