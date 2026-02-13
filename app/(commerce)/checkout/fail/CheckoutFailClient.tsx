"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiXCircle } from "react-icons/hi2";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { Button } from "@/components/ui/button";

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
  const [status, setStatus] = useState<"loading" | "done">(() =>
    orderId ? "loading" : "done"
  );
  const [result, setResult] = useState<{
    success: false;
    code: string;
    message: string;
    orderId: string;
    note?: string;
    apiResult?: Record<string, unknown>;
    dbUpdated?: boolean;
  }>({
    success: false,
    code,
    message,
    orderId: orderId || "(결제 취소 시 미전달)",
    note: "PAY_PROCESS_CANCELED 시 orderId가 전달되지 않습니다.",
  });

  useEffect(() => {
    if (!orderId) return;

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
    <div className="mx-auto max-w-[832px] px-4 py-12">
      <section
        className="rounded-lg px-6 py-10 text-center"
        style={{
          backgroundColor: commerceColors.background.default,
          boxShadow: `0 1px 3px ${commerceColors.neutral["04"]["15"]}`,
        }}
        aria-live="polite"
        aria-busy={status === "loading"}
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${commerceColors.semantic.error}20` }}
          aria-hidden
        >
          <HiXCircle
            className="h-8 w-8"
            style={{ color: commerceColors.semantic.error }}
          />
        </div>
        <h1
          className="mb-2"
          style={{
            fontFamily: commerceTypography.headline.h6.fontFamily,
            fontWeight: commerceTypography.headline.h6.fontWeight,
            fontSize: commerceTypography.headline.h6.fontSize,
            lineHeight: "34px",
            letterSpacing: "-0.6px",
            color: commerceColors.text.primary,
          }}
        >
          결제 실패
        </h1>
        {status === "loading" && orderId && (
          <p
            className="mb-6"
            style={{
              fontFamily: commerceTypography.body["2"].fontFamily,
              fontSize: commerceTypography.body["2"].fontSize,
              lineHeight: 1.5,
              color: commerceColors.text.secondary,
            }}
          >
            결제 실패 상태를 저장하는 중...
          </p>
        )}
        <p
          className="mb-4"
          style={{
            fontFamily: commerceTypography.body["2"].fontFamily,
            fontSize: commerceTypography.body["2"].fontSize,
            lineHeight: 1.5,
            color: commerceColors.text.secondary,
          }}
        >
          {result.message || "결제가 완료되지 않았습니다."}
        </p>
        {result.code && (
          <p
            className="mb-2"
            style={{
              fontFamily: commerceTypography.caption["1"].fontFamily,
              fontSize: "14px",
              lineHeight: 1.4,
              color: commerceColors.text.tertiary,
            }}
          >
            코드: {result.code}
          </p>
        )}
        {result.orderId && result.orderId !== "(결제 취소 시 미전달)" && (
          <p
            className="mb-8"
            style={{
              fontFamily: commerceTypography.caption["1-semi"].fontFamily,
              fontSize: "14px",
              lineHeight: "22px",
              color: commerceColors.neutral["07"]["100"],
            }}
          >
            주문 ID: {result.orderId}
          </p>
        )}
        {result.orderId === "(결제 취소 시 미전달)" && <div className="mb-8" />}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ACCOUNT_URLS.CHECKOUT}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--commerce-primary-main)]"
            aria-label="다시 결제하기"
          >
            <Button size="large" pill>
              다시 결제하기
            </Button>
          </Link>
          <Link
            href={ACCOUNT_URLS.CART}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--commerce-primary-main)]"
            aria-label="장바구니로 이동"
          >
            <Button variant="outline" size="large" pill>
              장바구니로
            </Button>
          </Link>
          <Link
            href={COMMERCE_URLS.PRODUCTS}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--commerce-primary-main)]"
            aria-label="쇼핑 계속하기"
          >
            <Button variant="outline" size="large" pill>
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
