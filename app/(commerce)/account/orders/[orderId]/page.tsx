import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/commerce/AccountSidebar";
import { OrderDetailSection } from "@/components/commerce/OrderDetailSection";
import { commerceTypography } from "@/commons/constants/typography";
import { commerceColors } from "@/commons/constants/color";
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
            My Account
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            <AccountSidebar
              displayName={displayName}
              email={email}
              imageUrl={imageUrl}
              activeItem="orders"
            />
            <div className="flex-1 min-w-0">
              <OrderDetailSection order={order} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
