import { ReviewSummarySkeleton } from "@/components/ui/ReviewSummarySkeleton";
import { cn } from "@/commons/utils/cn";

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-12 lg:px-16 xl:px-20">
      {/* 상품 영역 스켈레톤: 이미지 + 정보 */}
      <div
        className={cn("flex flex-col lg:flex-row gap-8")}
        role="status"
        aria-label="상품 정보 로딩 중"
      >
        <div
          className="relative shrink-0 w-full max-w-[600px] aspect-square rounded-lg bg-(--commerce-neutral-03-100) animate-pulse"
          aria-hidden
        />
        <div className="flex-1 flex flex-col gap-6">
          <div className="h-8 w-3/4 rounded bg-(--commerce-neutral-03-100) animate-pulse" />
          <div className="h-6 w-24 rounded bg-(--commerce-neutral-03-100) animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-(--commerce-neutral-03-100) animate-pulse" />
            <div className="h-4 w-full rounded bg-(--commerce-neutral-03-100) animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-(--commerce-neutral-03-100) animate-pulse" />
          </div>
          <div className="flex gap-4 mt-2">
            <div className="h-12 w-32 rounded bg-(--commerce-neutral-03-100) animate-pulse" />
            <div className="h-12 w-12 rounded-full bg-(--commerce-neutral-03-100) animate-pulse" />
          </div>
          <div className="h-14 w-full max-w-[508px] rounded-lg bg-(--commerce-neutral-03-100) animate-pulse" />
        </div>
      </div>

      {/* 탭 + 리뷰 영역: 요약만 스켈레톤, 리스트는 Suspense에서만 표시해 깜빡임 방지 */}
      <div className="mt-10">
        <div className="h-8 border-b border-(--commerce-neutral-03-100) flex gap-8 mb-4">
          <div className="h-8 w-20 rounded bg-(--commerce-neutral-03-100) animate-pulse" />
          <div className="h-8 w-28 rounded bg-(--commerce-neutral-03-100) animate-pulse" />
        </div>
        <ReviewSummarySkeleton className="mb-6" />
        <div
          className="space-y-4 animate-pulse"
          role="status"
          aria-label="리뷰 영역 로딩 중"
        >
          <div className="h-8 w-32 rounded bg-(--commerce-neutral-03-100)" />
          <div className="h-24 rounded-2xl bg-(--commerce-neutral-03-100)" />
          <div className="h-24 rounded-2xl bg-(--commerce-neutral-03-100)" />
        </div>
      </div>
    </div>
  );
}
