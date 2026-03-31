import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { AccountSidebar } from "@/components/commerce/AccountSidebar";
import { OrdersSection } from "@/components/commerce/OrdersSection/OrdersSection";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";

const PAGE_SIZE = 5;
const DEFAULT_PAGE = 1;

interface AccountOrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AccountOrdersPage({
  searchParams,
}: AccountOrdersPageProps) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const isAdmin = await checkAdminAccess();
  const params = await searchParams;
  const pageParam = params.page;
  const parsed = Number.parseInt(String(pageParam ?? ""), 10);
  const currentPage = Math.max(
    DEFAULT_PAGE,
    Math.min(Number.isNaN(parsed) ? DEFAULT_PAGE : parsed, 1e6)
  );

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  type OrderRow = {
    id: string;
    created_at: string | null;
    status: string;
    total_amount: number;
  };

  const {
    data: rows,
    error,
    count,
  } = await supabase
    .from("orders")
    .select("id, created_at, status, total_amount", { count: "exact" })
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`주문 목록 조회 실패: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (totalPages > 0 && currentPage > totalPages) {
    redirect(
      totalPages > 1
        ? `${ACCOUNT_URLS.ORDERS}?page=${totalPages}`
        : ACCOUNT_URLS.ORDERS
    );
  }

  type UserProfile = {
    display_name: string | null;
    email: string;
    role: "user" | "admin";
    image_url: string | null;
  };

  const profileResult = await supabase
    .from("users")
    .select("display_name, email, role, image_url")
    .eq("id", authUser.id)
    .single();

  const profile = profileResult.data as UserProfile | null;
  const displayName = profile?.display_name ?? null;
  const email = profile?.email ?? authUser.email ?? null;
  const imageUrl = profile?.image_url ?? null;

  const rawRows = (rows ?? []) as OrderRow[];
  const orders: OrderRow[] = rawRows.map((row) => ({
    id: row.id,
    created_at: row.created_at,
    status: row.status,
    total_amount: row.total_amount,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 py-8 md:py-12 lg:py-20">
        <div className="mx-auto max-w-[1120px] px-4 md:px-8 lg:px-20">
          <h1
            className="mb-12"
            style={{
              fontSize: commerceTypography.headline.h3.fontSize,
              lineHeight: "58px",
              fontFamily: commerceTypography.headline.h3.fontFamily,
              fontWeight: commerceTypography.headline.h3.fontWeight,
              letterSpacing: "-1px",
              color: commerceColors.text.primary,
            }}
          >
            My Account
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            <AccountSidebar
              displayName={displayName}
              email={email}
              imageUrl={imageUrl}
              activeItem="orders"
              isAdmin={isAdmin}
            />
            <div className="flex-1 min-w-0">
              <OrdersSection
                orders={orders}
                totalPages={totalPages}
                currentPage={currentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
