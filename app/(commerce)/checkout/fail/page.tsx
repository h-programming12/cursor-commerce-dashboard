import { CheckoutFailClient } from "./CheckoutFailClient";

export default async function CheckoutFailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const code = typeof params.code === "string" ? params.code : "";
  const message = typeof params.message === "string" ? params.message : "";
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  return <CheckoutFailClient code={code} message={message} orderId={orderId} />;
}
