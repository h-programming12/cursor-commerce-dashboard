"use client";

import { useEffect, useState } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

interface CheckoutSuccessClientProps {
  orderId: string;
  paymentKey: string;
  amount: string;
}

export function CheckoutSuccessClient({
  orderId,
  paymentKey,
  amount,
}: CheckoutSuccessClientProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!orderId || !paymentKey || !amount) {
      setResult({
        success: false,
        error: "결제 정보가 없습니다. (orderId, paymentKey, amount 필요)",
      });
      setStatus("error");
      return;
    }

    const amountNum = Number(amount);
    if (Number.isNaN(amountNum)) {
      setResult({ success: false, error: "유효하지 않은 금액입니다." });
      setStatus("error");
      return;
    }

    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        paymentKey,
        amount: amountNum,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setResult({
            success: false,
            error: (data.error as string) ?? "결제 승인에 실패했습니다.",
            code: data.code,
          });
          setStatus("error");
          return;
        }
        setResult({
          success: true,
          orderId: data.orderId,
          alreadyConfirmed: data.alreadyConfirmed,
          message: "결제가 완료되었고, 주문·결제 상태가 갱신되었습니다.",
        });
        setStatus("success");
      })
      .catch(() => {
        setResult({
          success: false,
          error: "결제 승인 요청 중 오류가 발생했습니다.",
        });
        setStatus("error");
      });
  }, [orderId, paymentKey, amount]);

  const title =
    status === "loading"
      ? "결제 확인 중..."
      : status === "success"
      ? "결제 성공"
      : "결제 처리 실패";

  const titleColor =
    status === "error"
      ? commerceColors.semantic.error
      : commerceColors.text.primary;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-12">
      <h1
        className="mb-6"
        style={{
          fontFamily: commerceTypography.headline.h7.fontFamily,
          fontWeight: commerceTypography.headline.h7.fontWeight,
          fontSize: "24px",
          lineHeight: "32px",
          color: titleColor,
        }}
      >
        {title}
      </h1>
      {status === "loading" && (
        <p
          style={{
            fontFamily: commerceTypography.body["2"].fontFamily,
            fontSize: "16px",
            lineHeight: "26px",
            color: commerceColors.text.secondary,
          }}
        >
          잠시만 기다려 주세요.
        </p>
      )}
      {result && (
        <pre
          className="p-6 rounded overflow-auto"
          style={{
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: 1.5,
            backgroundColor: commerceColors.background.light,
            border: `1px solid ${commerceColors.neutral["04"]["100"]}`,
            color: commerceColors.text.primary,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
