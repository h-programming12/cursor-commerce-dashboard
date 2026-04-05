import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { AccountSidebar } from "@/components/commerce/AccountSidebar";
import { LikeListSection } from "@/components/commerce/LikeListSection";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { getWishlistPage } from "@/app/(commerce)/likes/actions";

const DEFAULT_PAGE = 1;

interface AccountWishlistPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AccountWishlistPage({
  searchParams,
}: AccountWishlistPageProps) {
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

  const { items, totalPages } = await getWishlistPage(currentPage);

  if (totalPages > 0 && currentPage > totalPages) {
    redirect(
      totalPages > 1
        ? `/account/wishlist?page=${totalPages}`
        : "/account/wishlist"
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 py-8 md:py-12 lg:py-20">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 md:px-8 lg:px-20">
          <h1
            className="mb-6 md:mb-12"
            style={{
              fontSize: "clamp(32px, 7vw, 54px)",
              lineHeight: "58px",
              fontFamily: commerceTypography.headline.h3.fontFamily,
              fontWeight: commerceTypography.headline.h3.fontWeight,
              letterSpacing: "-1px",
              color: commerceColors.text.primary,
            }}
          >
            My Wishlist
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            <AccountSidebar
              displayName={displayName}
              email={email}
              imageUrl={imageUrl}
              activeItem="wishlist"
              isAdmin={isAdmin}
            />
            <div className="flex-1 min-w-0">
              <LikeListSection
                items={items}
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
