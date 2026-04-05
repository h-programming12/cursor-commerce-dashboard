import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { AccountSidebar } from "@/components/commerce/AccountSidebar";
import { AccountDetailsForm } from "@/components/commerce/AccountDetailsForm";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // 프로필 조회
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

  const displayName = profile?.display_name || null;
  const email = profile?.email || authUser.email || null;
  const imageUrl = profile?.image_url || null;
  const isAdmin = await checkAdminAccess();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Content */}
      <div className="flex-1 py-8 md:py-12 lg:py-20">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 md:px-8 lg:px-20">
          {/* Title */}
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
            My Account
          </h1>

          {/* Account Section */}
          <div className="flex flex-col md:flex-row gap-6">
            <AccountSidebar
              displayName={displayName}
              email={email}
              imageUrl={imageUrl}
              activeItem="account"
              isAdmin={isAdmin}
            />
            <div className="flex-1 min-w-0">
              <AccountDetailsForm
                initialDisplayName={displayName}
                email={email}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
