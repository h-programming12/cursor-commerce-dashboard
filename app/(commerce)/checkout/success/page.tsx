import { CheckoutSuccessClient } from "./CheckoutSuccessClient";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderId = typeof params.orderId === "string" ? params.orderId : "";
  const paymentKey =
    typeof params.paymentKey === "string" ? params.paymentKey : "";
  const amount = typeof params.amount === "string" ? params.amount : "";

  return (
    <CheckoutSuccessClient
      orderId={orderId}
      paymentKey={paymentKey}
      amount={amount}
    />
  );
}
