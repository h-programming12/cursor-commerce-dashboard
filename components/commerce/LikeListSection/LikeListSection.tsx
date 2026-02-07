import { AccountPagination } from "@/components/commerce/AccountPagination";
import { LikeEmptyState } from "@/components/commerce/LikeEmptyState";
import { LikeListTable } from "@/components/commerce/LikeListTable";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import type { WishlistItem } from "@/app/(commerce)/likes/wishlist-types";

export interface LikeListSectionProps {
  items: WishlistItem[];
  totalPages: number;
  currentPage: number;
}

export function LikeListSection({
  items,
  totalPages,
  currentPage,
}: LikeListSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2
        className=""
        style={{
          fontSize: commerceTypography.headline.h7.fontSize,
          lineHeight: "32px",
          fontFamily: commerceTypography.headline.h7.fontFamily,
          fontWeight: 600,
          color: commerceColors.text.primary,
        }}
      >
        Wishlist
      </h2>
      {items.length === 0 ? (
        <LikeEmptyState />
      ) : (
        <>
          <LikeListTable items={items} />
          <AccountPagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={ACCOUNT_URLS.WISHLIST}
          />
        </>
      )}
    </div>
  );
}
