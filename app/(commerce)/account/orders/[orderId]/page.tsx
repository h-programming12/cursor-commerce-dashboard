import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { AccountPageShell } from "@/components/commerce";
import { OrderDetailSection } from "@/components/commerce/OrderDetailSection";
import { getOrderDetail } from "./queries";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const isAdmin = await checkAdminAccess();
  const { orderId } = await params;
  const order = await getOrderDetail(orderId, authUser.id);

  if (!order) {
    notFound();
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
      title={`Order #${orderId}`}
      activeItem="orders"
      displayName={displayName}
      email={email}
      imageUrl={imageUrl}
      isAdmin={isAdmin}
    >
      <OrderDetailSection order={order} />
    </AccountPageShell>
  );
}
