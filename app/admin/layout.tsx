export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* 관리자 공통 레이아웃 */}
      {children}
    </div>
  );
}
