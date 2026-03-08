import { createClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";
import { AdminLayout } from "@/components/admin/AdminLayout/AdminLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminAccess();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let email = "";
  if (user) {
    const res = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id)
      .maybeSingle();
    const row = res.data as { email: string } | null;
    email = row?.email ?? "";
  }

  return <AdminLayout email={email}>{children}</AdminLayout>;
}
