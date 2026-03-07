import { LoadingSkeletonGrid } from "@/components/commerce";
import { cn } from "@/commons/utils/cn";

export default function ProductsLoading() {
  return (
    <div className="w-full">
      <div
        className="mx-auto max-w-[1440px]"
        style={{
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: "48px",
          paddingBottom: "48px",
        }}
      >
        <div
          className="mb-12 h-10 w-48 animate-pulse rounded bg-(--commerce-neutral-03-100) mx-auto"
          style={{ color: "var(--commerce-text-primary)" }}
          role="presentation"
        />
        <LoadingSkeletonGrid
          count={8}
          columns={4}
          gap="medium"
          className={cn("w-full")}
        />
      </div>
    </div>
  );
}
