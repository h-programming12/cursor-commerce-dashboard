import { notFound } from "next/navigation";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getAdminDetail } from "@/app/admin/queries";

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

export default async function AdminAdminDetailPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  await requireAdminAccess();
  const { adminId } = await params;
  const admin = await getAdminDetail(adminId);
  if (!admin) notFound();

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
        관리자 상세
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
          기본 정보
        </h2>
        <dl className="grid gap-3" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt style={labelStyle}>ID</dt>
          <dd style={valueStyle}>{admin.id}</dd>
          <dt style={labelStyle}>이메일</dt>
          <dd style={valueStyle}>{admin.email}</dd>
          <dt style={labelStyle}>이름</dt>
          <dd style={valueStyle}>{admin.display_name ?? "-"}</dd>
          <dt style={labelStyle}>역할</dt>
          <dd style={valueStyle}>{admin.role}</dd>
          <dt style={labelStyle}>가입일</dt>
          <dd style={valueStyle}>{formatDate(admin.created_at)}</dd>
          <dt style={labelStyle}>수정일</dt>
          <dd style={valueStyle}>{formatDate(admin.updated_at)}</dd>
        </dl>
      </section>
    </div>
  );
}
