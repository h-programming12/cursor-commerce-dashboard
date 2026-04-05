import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { AccountPageShell } from "@/components/commerce";
import { AccountDetailsForm } from "@/components/commerce/AccountDetailsForm";

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
    <AccountPageShell
      title="My Account"
      activeItem="account"
      displayName={displayName}
      email={email}
      imageUrl={imageUrl}
      isAdmin={isAdmin}
    >
      <AccountDetailsForm initialDisplayName={displayName} email={email} />
    </AccountPageShell>
  );
}
