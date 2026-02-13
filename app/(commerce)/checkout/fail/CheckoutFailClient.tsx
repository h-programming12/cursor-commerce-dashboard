"use client";

import { useEffect, useState } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

interface CheckoutFailClientProps {
  code: string;
  message: string;
  orderId: string;
}

export function CheckoutFailClient({
  code,
  message,
  orderId,
}: CheckoutFailClientProps) {
  const [status, setStatus] = useState<"loading" | "done">("loading");
  const [result, setResult] = useState<Record<string, unknown>>({
    success: false,
    code,
    message,
    orderId: orderId || "(결제 취소 시 미전달)",
    note: "PAY_PROCESS_CANCELED 시 orderId가 전달되지 않습니다.",
  });

  useEffect(() => {
    if (!orderId) {
      setStatus("done");
      return;
    }

    fetch("/api/payments/fail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        setResult((prev) => ({
          ...prev,
          apiResult: data,
          dbUpdated: res.ok ? true : false,
        }));
        setStatus("done");
      })
      .catch(() => {
        setResult((prev) => ({
          ...prev,
          apiResult: { error: "실패 상태 저장 요청 중 오류" },
          dbUpdated: false,
        }));
        setStatus("done");
      });
  }, [orderId]);

  return (
    <div className="mx-auto max-w-[800px] px-4 py-12">
      <h1
        className="mb-6"
        style={{
          fontFamily: commerceTypography.headline.h7.fontFamily,
          fontWeight: commerceTypography.headline.h7.fontWeight,
          fontSize: "24px",
          lineHeight: "32px",
          color: commerceColors.semantic.error,
        }}
      >
        결제 실패
      </h1>
      {status === "loading" && orderId && (
        <p
          className="mb-4"
          style={{
            fontFamily: commerceTypography.body["2"].fontFamily,
            fontSize: "16px",
            lineHeight: "26px",
            color: commerceColors.text.secondary,
          }}
        >
          결제 실패 상태를 저장하는 중...
        </p>
      )}
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
    </div>
  );
}
