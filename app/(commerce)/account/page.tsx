import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountSidebar } from "@/components/commerce/AccountSidebar/AccountSidebar";
import { AccountDetailsForm } from "@/components/commerce/AccountDetailsForm/AccountDetailsForm";
import { commerceTypography } from "@/commons/constants/typography";
import { commerceColors } from "@/commons/constants/color";
import { AUTH_URLS } from "@/commons/constants/url";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(AUTH_URLS.LOGIN);
  }

  // 프로필 조회
  type UserProfile = {
    display_name: string | null;
    email: string;
    role: string;
  };

  type SupabaseResponse<T> = {
    data: T | null;
    error: { message: string; code?: string } | null;
  };

  const { data: profile, error: profileError } = (await supabase
    .from("users")
    .select("display_name, email, role")
    .eq("id", authUser.id)
    .single()) as SupabaseResponse<UserProfile>;

  let userProfile: UserProfile | null = profile;

  // 프로필이 없으면 자동 생성 (RLS 정책에 의해 자신의 id로만 insert 가능)
  if (!userProfile && authUser && !profileError) {
    const displayNameFromEmail = authUser.email?.split("@")[0] || null;
    const displayNameFromMeta =
      authUser.user_metadata?.display_name ||
      authUser.user_metadata?.full_name ||
      null;

    const insertData = {
      id: authUser.id,
      email: authUser.email || "",
      display_name: displayNameFromMeta || displayNameFromEmail,
      role: (authUser.user_metadata?.role as "user" | "admin") || "user",
    };

    const { data: newProfile } = (await supabase
      .from("users")
      .insert(insertData as never)
      .select("display_name, email, role")
      .single()) as SupabaseResponse<UserProfile>;

    if (newProfile) {
      userProfile = newProfile;
    }
  }

  // 프로필이 없거나 에러 발생 시 auth.users의 email 사용
  const displayName = userProfile?.display_name || null;
  const email = userProfile?.email || authUser.email || "";

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="mx-auto max-w-[1440px] px-6">
        {/* Title */}
        <div style={{ paddingTop: "80px", paddingBottom: "40px" }}>
          <h1
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
        </div>

        {/* Account Section */}
        <div className="flex gap-8" style={{ paddingBottom: "48px" }}>
          {/* Sidebar */}
          <AccountSidebar displayName={displayName} email={email} />

          {/* Main Content */}
          <div style={{ flex: 1, maxWidth: "851px" }}>
            <AccountDetailsForm
              initialDisplayName={displayName}
              email={email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
