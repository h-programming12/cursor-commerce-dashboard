import { LayoutHeader, LayoutFooter } from "@/components/commerce";
import { SearchOverlay } from "@/features/search/components/SearchOverlay";

export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <LayoutHeader />
      <main className="flex-1">{children}</main>
      <LayoutFooter />
      <SearchOverlay />
    </div>
  );
}
