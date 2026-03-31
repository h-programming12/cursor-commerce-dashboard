import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutPageClient } from "@/app/(commerce)/checkout/CheckoutPageClient";
import { commerceColors } from "@/commons/constants/color";
import { ACCOUNT_URLS } from "@/commons/constants/url";

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE_AMOUNT = 2500;

function calcShippingFeeServer(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_AMOUNT;
}

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const profileResult = await supabase
    .from("users")
    .select("display_name, email")
    .eq("id", authUser.id)
    .single();

  const profile = profileResult.data as {
    display_name: string | null;
    email: string;
  } | null;
  const displayName = profile?.display_name ?? null;
  const email = profile?.email ?? authUser.email ?? null;

  const { data: cartRows, error: cartError } = await supabase
    .from("cart_items")
    .select(
      `
      product_id,
      quantity,
      products (
        id,
        name,
        price,
        sale_price,
        image_url,
        status
      )
    `
    )
    .eq("user_id", authUser.id);

  if (cartError) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
        <p style={{ color: commerceColors.semantic.error }}>
          장바구니를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  const rawItems = (cartRows ?? []).filter((row: Record<string, unknown>) => {
    const products = row.products as Record<string, unknown> | null;
    const status = products?.status as string | undefined;
    return status !== "hidden";
  });

  type ProductRow = {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    image_url: string | null;
  };

  const lineItems = rawItems.map((row: Record<string, unknown>) => {
    const product = row.products as ProductRow | null;
    const productId = (row.product_id as string) ?? product?.id ?? "";
    const price = Number(product?.price ?? 0);
    const salePrice =
      product?.sale_price != null ? Number(product.sale_price) : null;
    const unitPrice = salePrice ?? price;
    const quantity = Number(row.quantity ?? 1);
    const lineSubtotal = unitPrice * quantity;
    return {
      productId,
      productName: (product?.name as string) ?? "",
      productImageUrl: (product?.image_url as string) ?? null,
      quantity,
      unitPrice,
      lineTotal: lineSubtotal,
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = calcShippingFeeServer(subtotal);
  const discount = 0;
  const total = Math.round(subtotal) + shippingFee - discount;

  const serverSubtotal = Math.round(subtotal);
  const serverShippingFee = shippingFee;
  const serverDiscount = discount;
  const serverTotal = total;

  const defaultUser = {
    contactName: displayName,
    contactEmail: email,
    contactPhone: null as string | null,
    shippingName: null as string | null,
    shippingPhone: null as string | null,
    shippingAddressLine1: null as string | null,
    shippingAddressLine2: null as string | null,
    shippingCity: null as string | null,
    shippingState: null as string | null,
    shippingZip: null as string | null,
    shippingCountry: null as string | null,
  };

  if (lineItems.length === 0) {
    redirect(ACCOUNT_URLS.CART);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="mb-8"
        style={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "clamp(32px, 7vw, 54px)",
          lineHeight: "58px",
          letterSpacing: "-1px",
          color: commerceColors.text.primary,
        }}
      >
        Check Out
      </h1>

      <nav
        className="flex flex-wrap items-center gap-6 mb-10"
        aria-label="Checkout process"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              backgroundColor: commerceColors.neutral["04"]["100"],
              color: commerceColors.background.default,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
            }}
          >
            1
          </span>
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
              color: commerceColors.text.tertiary,
            }}
          >
            <span className="sm:hidden">Cart</span>
            <span className="hidden sm:inline">Shopping cart</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              backgroundColor: commerceColors.neutral["05"]["100"],
              color: commerceColors.background.default,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
            }}
          >
            2
          </span>
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
              color: commerceColors.text.primary,
            }}
          >
            <span className="sm:hidden">Checkout</span>
            <span className="hidden sm:inline">Checkout details</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              backgroundColor: commerceColors.neutral["04"]["100"],
              color: commerceColors.background.default,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
            }}
          >
            3
          </span>
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
              color: commerceColors.text.tertiary,
            }}
          >
            <span className="sm:hidden">Complete</span>
            <span className="hidden sm:inline">Order complete</span>
          </span>
        </div>
      </nav>

      <CheckoutPageClient
        defaultUser={defaultUser}
        lineItems={lineItems}
        subtotal={subtotal}
        shippingFee={shippingFee}
        discount={discount}
        total={total}
        serverSubtotal={serverSubtotal}
        serverShippingFee={serverShippingFee}
        serverDiscount={serverDiscount}
        serverTotal={serverTotal}
      />
    </div>
  );
}
