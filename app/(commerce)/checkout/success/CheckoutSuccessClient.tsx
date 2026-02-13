"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiCheck } from "react-icons/hi2";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { Button } from "@/components/ui/button";

interface CheckoutSuccessClientProps {
  orderId: string;
  paymentKey: string;
  amount: string;
}

function formatOrderCode(id: string): string {
  if (!id) return "—";
  const short = id.replace(/-/g, "").slice(-9);
  return `#${short.slice(0, 4)}_${short.slice(4)}`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

export function CheckoutSuccessClient({
  orderId,
  paymentKey,
  amount,
}: CheckoutSuccessClientProps) {
  const hasParams = Boolean(orderId && paymentKey && amount);
  const amountNum = Number(amount);
  const isValidAmount = !Number.isNaN(amountNum);

  const validationError: Record<string, unknown> | null = !hasParams
    ? {
        success: false,
        error: "결제 정보가 없습니다. (orderId, paymentKey, amount 필요)",
      }
    : !isValidAmount
    ? { success: false, error: "유효하지 않은 금액입니다." }
    : null;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [result, setResult] = useState<{
    success?: boolean;
    orderId?: string;
    alreadyConfirmed?: boolean;
    message?: string;
    error?: string;
    code?: string;
  } | null>(null);

  useEffect(() => {
    if (!orderId || !paymentKey || !amount) return;
    const num = Number(amount);
    if (Number.isNaN(num)) return;

    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        paymentKey,
        amount: num,
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

  const displayStatus = validationError ? "error" : status;
  const displayResult = validationError ?? result;

  const title =
    displayStatus === "loading"
      ? "결제 확인 중..."
      : displayStatus === "success"
      ? "Complete!"
      : "결제 처리 실패";

  const titleColor =
    displayStatus === "error"
      ? commerceColors.semantic.error
      : commerceColors.text.primary;

  const stepLabelStyle = {
    fontFamily: commerceTypography.body["2-semi"].fontFamily,
    fontWeight: commerceTypography.body["2-semi"].fontWeight,
    fontSize: "16px",
    lineHeight: "26px",
    letterSpacing: 0,
  };

  return (
    <div className="mx-auto max-w-[832px] px-4 py-12">
      <section className="mb-8" aria-label="결제 단계">
        <h1
          className="mb-6"
          style={{
            fontFamily: commerceTypography.headline.h3.fontFamily,
            fontWeight: commerceTypography.headline.h3.fontWeight,
            fontSize: commerceTypography.headline.h3.fontSize,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: titleColor,
          }}
        >
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: commerceColors.semantic.success,
                color: commerceColors.text.inverse,
              }}
              aria-hidden
            >
              <HiCheck className="h-6 w-6" />
            </span>
            <span
              style={{
                ...stepLabelStyle,
                color: commerceColors.semantic.success,
              }}
            >
              Shopping cart
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: commerceColors.semantic.success,
                color: commerceColors.text.inverse,
              }}
              aria-hidden
            >
              <HiCheck className="h-6 w-6" />
            </span>
            <span
              style={{
                ...stepLabelStyle,
                color: commerceColors.semantic.success,
              }}
            >
              Checkout details
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  displayStatus === "success"
                    ? commerceColors.neutral["06"]["100"]
                    : commerceColors.neutral["04"]["100"],
                color: commerceColors.text.inverse,
                ...stepLabelStyle,
              }}
              aria-hidden
            >
              {displayStatus === "success" ? "3" : "..."}
            </span>
            <span
              style={{
                ...stepLabelStyle,
                color: commerceColors.neutral["06"]["100"],
              }}
            >
              Order complete
            </span>
          </div>
        </div>
      </section>

      <section
        className="rounded-lg px-6 py-10 text-center"
        style={{
          backgroundColor: commerceColors.background.default,
          boxShadow: `0 1px 3px ${commerceColors.neutral["04"]["15"]}`,
        }}
        aria-live="polite"
        aria-busy={displayStatus === "loading"}
      >
        {displayStatus === "loading" && (
          <p
            style={{
              fontFamily: commerceTypography.body["2"].fontFamily,
              fontSize: commerceTypography.body["2"].fontSize,
              lineHeight: 1.5,
              color: commerceColors.text.secondary,
            }}
          >
            잠시만 기다려 주세요.
          </p>
        )}

        {displayStatus === "success" && result?.success && (
          <>
            <p
              className="mb-2"
              style={{
                fontFamily: commerceTypography.headline.h6.fontFamily,
                fontWeight: commerceTypography.headline.h6.fontWeight,
                fontSize: commerceTypography.headline.h6.fontSize,
                lineHeight: "34px",
                letterSpacing: "-0.6px",
                color: commerceColors.text.tertiary,
              }}
            >
              Thank you! 🎉
            </p>
            <p
              className="mb-10"
              style={{
                fontFamily: commerceTypography.headline.h5.fontFamily,
                fontWeight: commerceTypography.headline.h5.fontWeight,
                fontSize: commerceTypography.headline.h5.fontSize,
                lineHeight: "44px",
                letterSpacing: "-0.4px",
                color: commerceColors.neutral["07"]["100"],
              }}
            >
              Your order has been received
            </p>
            <div
              className="mx-auto mb-8 max-w-[548px] text-left"
              role="region"
              aria-label="주문 요약"
            >
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4">
                <dt
                  style={{
                    ...commerceTypography.caption["1-semi"],
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.text.tertiary,
                  }}
                >
                  Order code:
                </dt>
                <dd
                  style={{
                    ...commerceTypography.caption["1-semi"],
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.neutral["07"]["100"],
                  }}
                >
                  {formatOrderCode(result.orderId ?? orderId)}
                </dd>
                <dt
                  style={{
                    ...commerceTypography.caption["1-semi"],
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.text.tertiary,
                  }}
                >
                  Date:
                </dt>
                <dd
                  style={{
                    ...commerceTypography.caption["1-semi"],
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.neutral["07"]["100"],
                  }}
                >
                  {formatDate(new Date().toISOString())}
                </dd>
                <dt
                  style={{
                    ...commerceTypography.caption["1-semi"],
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.text.tertiary,
                  }}
                >
                  Total:
                </dt>
                <dd
                  style={{
                    ...commerceTypography.caption["1-semi"],
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.neutral["07"]["100"],
                  }}
                >
                  {formatAmount(amountNum)}
                </dd>
                <dt
                  style={{
                    ...commerceTypography.caption["1-semi"],
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.text.tertiary,
                  }}
                >
                  Payment method:
                </dt>
                <dd
                  style={{
                    ...commerceTypography.caption["1-semi"],
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: commerceColors.neutral["07"]["100"],
                  }}
                >
                  카드
                </dd>
              </dl>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={ACCOUNT_URLS.ACCOUNT}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--commerce-primary-main)]"
                aria-label="쇼핑 계속하기"
              >
                <Button size="large" pill>
                  다시 쇼핑하기
                </Button>
              </Link>
              <Link
                href={COMMERCE_URLS.PRODUCTS}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--commerce-primary-main)]"
                aria-label="상품 목록으로 이동"
              >
                <Button variant="outline" size="large" pill>
                  상품 목록
                </Button>
              </Link>
            </div>
          </>
        )}

        {displayStatus === "error" && displayResult && (
          <>
            <p
              className="mb-2"
              style={{
                fontFamily: commerceTypography.headline.h6.fontFamily,
                fontWeight: commerceTypography.headline.h6.fontWeight,
                fontSize: commerceTypography.headline.h6.fontSize,
                lineHeight: "34px",
                color: commerceColors.text.tertiary,
              }}
            >
              결제 처리 실패
            </p>
            <p
              className="mb-6"
              style={{
                fontFamily: commerceTypography.body["2"].fontFamily,
                fontSize: commerceTypography.body["2"].fontSize,
                lineHeight: 1.5,
                color: commerceColors.semantic.error,
              }}
            >
              {(displayResult as { error?: string }).error ??
                "오류가 발생했습니다."}
            </p>
            {displayResult &&
              typeof (displayResult as { code?: string }).code === "string" && (
                <p
                  className="mb-6 text-left"
                  style={{
                    fontFamily: commerceTypography.caption["1"].fontFamily,
                    fontSize: "14px",
                    lineHeight: 1.4,
                    color: commerceColors.text.tertiary,
                  }}
                >
                  코드: {(displayResult as { code: string }).code}
                </p>
              )}
            <Link
              href={COMMERCE_URLS.PRODUCTS}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--commerce-primary-main)]"
              aria-label="쇼핑 계속하기"
            >
              <Button size="large" pill>
                다시 쇼핑하기
              </Button>
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
