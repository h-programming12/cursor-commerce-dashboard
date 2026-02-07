import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  };

  const profileResult = await supabase
    .from("users")
    .select("display_name, email, role")
    .eq("id", authUser.id)
    .single();

  const profile = profileResult.data as UserProfile | null;

  const displayName = profile?.display_name || null;
  const email = profile?.email || authUser.email || null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Content */}
      <div className="flex-1" style={{ padding: "80px 0" }}>
        <div
          className="mx-auto"
          style={{
            maxWidth: "1120px",
            paddingLeft: "80px",
            paddingRight: "80px",
          }}
        >
          {/* Title */}
          <h1
            className="mb-12"
            style={{
              fontSize: "54px",
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
          <div className="flex gap-6">
            {/* Sidebar */}
            <AccountSidebar
              displayName={displayName}
              email={email}
              activeItem="account"
            />

            {/* Detail Form */}
            <div className="flex-1">
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
