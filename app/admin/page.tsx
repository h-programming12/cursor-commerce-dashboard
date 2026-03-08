import { requireAdminAccess } from "@/lib/auth/admin";
import {
  getTodayOrderCount,
  getBestSellingProducts,
  getTrendingProducts,
  getRecentOrders,
} from "./queries";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { ProductList } from "@/components/admin/dashboard/ProductList";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";
import type { DashboardProductItem } from "@/components/admin/dashboard/ProductList";

export default async function AdminDashboardPage() {
  await requireAdminAccess();

  const [todayCount, bestSelling, trending, recentOrders] = await Promise.all([
    getTodayOrderCount(),
    getBestSellingProducts(10),
    getTrendingProducts(10),
    getRecentOrders(10),
  ]);

  const bestSellingForList: DashboardProductItem[] = bestSelling.map((p) => ({
    product_id: p.product_id,
    product_name: p.product_name,
    image_url: p.image_url,
    count: p.total_quantity,
    countLabel: "판매량",
  }));

  const trendingForList: DashboardProductItem[] = trending.map((p) => ({
    product_id: p.product_id,
    product_name: p.product_name,
    image_url: p.image_url,
    count: p.like_count,
    countLabel: "좋아요",
  }));

  return (
    <div>
      <h1
        className="mb-6"
        style={{
          fontSize: "var(--admin-headline-h6-font-size)",
          lineHeight: 1.2,
          fontFamily: "var(--admin-font-poppins)",
          fontWeight: "var(--admin-font-medium)",
          color: "var(--admin-text-primary)",
        }}
      >
        Dashboard
      </h1>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={todayCount} label="오늘 주문 수" />
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <ProductList
          title="Best Selling Products"
          products={bestSellingForList}
          emptyMessage="판매 데이터가 없습니다."
        />
        <ProductList
          title="Trending Products"
          products={trendingForList}
          emptyMessage="좋아요 데이터가 없습니다."
        />
      </section>

      <section>
        <RecentOrdersTable orders={recentOrders} />
      </section>
    </div>
  );
}
