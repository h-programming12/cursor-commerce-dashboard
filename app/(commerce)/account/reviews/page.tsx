import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountSidebar } from "@/components/commerce/AccountSidebar";
import { MyReviewsSection } from "@/components/commerce/MyReviewsSection/MyReviewsSection";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import type { Review } from "@/components/commerce/types";

const PAGE_SIZE = 5;
const DEFAULT_PAGE = 1;

interface AccountReviewsPageProps {
  searchParams: Promise<{ page?: string }>;
}

type ReviewRow = {
  id: string;
  rating: number;
  content: string | null;
  created_at: string;
  product_id: string | null;
  products: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
};

type UserProfile = {
  display_name: string | null;
  email: string;
  role: "user" | "admin";
  image_url: string | null;
};

function formatReviewDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AccountReviewsPage({
  searchParams,
}: AccountReviewsPageProps) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const params = await searchParams;
  const pageParam = params.page;
  const parsed = Number.parseInt(String(pageParam ?? ""), 10);
  const currentPage = Math.max(
    DEFAULT_PAGE,
    Math.min(Number.isNaN(parsed) ? DEFAULT_PAGE : parsed, 1e6)
  );

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: rows,
    error,
    count,
  } = await supabase
    .from("reviews")
    .select(
      "id, rating, content, created_at, product_id, products ( id, name, image_url )",
      { count: "exact" }
    )
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`리뷰 목록 조회 실패: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (totalPages > 0 && currentPage > totalPages) {
    redirect(
      totalPages > 1
        ? `${ACCOUNT_URLS.REVIEWS}?page=${totalPages}`
        : ACCOUNT_URLS.REVIEWS
    );
  }

  const profileResult = await supabase
    .from("users")
    .select("display_name, email, role, image_url")
    .eq("id", authUser.id)
    .single();

  const profile = profileResult.data as UserProfile | null;
  const displayName = profile?.display_name ?? null;
  const email = profile?.email ?? authUser.email ?? null;
  const imageUrl = profile?.image_url ?? null;

  const rawRows = (rows ?? []) as ReviewRow[];

  const reviews = rawRows.map((row) => {
    const review: Review = {
      id: row.id,
      userId: authUser.id,
      userName: profile?.display_name || email || "사용자",
      userAvatar: imageUrl ?? undefined,
      rating: row.rating,
      comment: row.content ?? "",
      date: formatReviewDate(row.created_at),
    };

    const product = row.products
      ? {
          id: row.products.id,
          name: row.products.name,
          imageUrl: row.products.image_url,
        }
      : null;

    return {
      review,
      product,
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1" style={{ padding: "80px 0" }}>
        <div
          className="mx-auto"
          style={{
            maxWidth: "1120px",
            paddingLeft: "80px",
            paddingRight: "80px",
          }}
        >
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
            My Reviews
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            <AccountSidebar
              displayName={displayName}
              email={email}
              imageUrl={imageUrl}
              activeItem="reviews"
            />
            <div className="flex-1 min-w-0">
              <MyReviewsSection
                reviews={reviews}
                totalPages={totalPages}
                currentPage={currentPage}
                currentUserId={authUser.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
