import { AccountPagination } from "@/components/commerce/AccountPagination";
import { OrdersEmptyState } from "@/components/commerce/OrdersEmptyState/OrdersEmptyState";
import { OrdersTable } from "@/components/commerce/OrdersTable/OrdersTable";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import type { OrderRow } from "@/components/commerce/OrdersTable/OrdersTable";

export interface OrdersSectionProps {
  orders: OrderRow[];
  totalPages: number;
  currentPage: number;
}

export function OrdersSection({
  orders,
  totalPages,
  currentPage,
}: OrdersSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2
        style={{
          fontSize: commerceTypography.headline.h7.fontSize,
          lineHeight: "32px",
          fontFamily: commerceTypography.headline.h7.fontFamily,
          fontWeight: 600,
          color: commerceColors.text.primary,
        }}
      >
        Orders History
      </h2>
      {orders.length === 0 ? (
        <OrdersEmptyState />
      ) : (
        <>
          <OrdersTable orders={orders} />
          <AccountPagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={ACCOUNT_URLS.ORDERS}
          />
        </>
      )}
    </div>
  );
}
