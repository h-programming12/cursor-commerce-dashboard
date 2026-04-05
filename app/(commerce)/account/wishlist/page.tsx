import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { AccountPageShell } from "@/components/commerce";
import { LikeListSection } from "@/components/commerce/LikeListSection";
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
    <AccountPageShell
      title="My Wishlist"
      activeItem="wishlist"
      displayName={displayName}
      email={email}
      imageUrl={imageUrl}
      isAdmin={isAdmin}
    >
      <LikeListSection
        items={items}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </AccountPageShell>
  );
}
