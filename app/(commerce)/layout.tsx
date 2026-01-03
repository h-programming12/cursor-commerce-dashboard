export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* 커머스 공통 레이아웃 */}
      {children}
    </div>
  );
}
