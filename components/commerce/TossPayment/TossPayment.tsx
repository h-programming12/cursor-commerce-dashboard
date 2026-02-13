"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

export interface TossPaymentRequestParams {
  tossOrderId: string;
  amount: number;
  orderName: string;
  customerEmail: string;
  customerName: string;
  customerMobilePhone?: string;
  successUrl: string;
  failUrl: string;
}

export interface TossPaymentHandle {
  requestPayment: (params: TossPaymentRequestParams) => Promise<void>;
  ready: boolean;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      payment: (options?: { customerKey?: string }) => {
        requestPayment: (params: {
          method: string;
          amount: { currency: string; value: number };
          orderId: string;
          orderName: string;
          successUrl: string;
          failUrl: string;
          customerEmail?: string;
          customerName?: string;
          customerMobilePhone?: string;
          card?: {
            useEscrow?: boolean;
            useCardPoint?: boolean;
            useAppCardOnly?: boolean;
          };
        }) => Promise<void>;
      };
    };
  }
}

export interface TossPaymentProps {
  clientKey: string;
  customerKey?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("document is not available"));
      return;
    }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.TossPayments) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error(`Failed to load script: ${src}`))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export const TossPayment = React.forwardRef<
  TossPaymentHandle,
  TossPaymentProps
>(function TossPayment({ clientKey, customerKey, onReady, onError }, ref) {
  const [ready, setReady] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (!clientKey || initRef.current) return;

    initRef.current = true;
    loadScript(TOSS_SDK_URL)
      .then(() => {
        if (!window.TossPayments) {
          throw new Error("TossPayments SDK가 로드되지 않았습니다.");
        }
        setReady(true);
        onReady?.();
      })
      .catch((err) => {
        const e = err instanceof Error ? err : new Error(String(err));
        onError?.(e);
        setReady(false);
      });
  }, [clientKey, onReady, onError]);

  const requestPayment = useCallback(
    async (params: TossPaymentRequestParams) => {
      if (!window.TossPayments || !clientKey) {
        throw new Error("토스페이먼츠 SDK가 준비되지 않았습니다.");
      }

      const tosspayments = window.TossPayments(clientKey);
      const payment = tosspayments.payment({
        customerKey: customerKey ?? params.tossOrderId,
      });

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: params.amount,
        },
        orderId: params.tossOrderId,
        orderName: params.orderName,
        successUrl: params.successUrl,
        failUrl: params.failUrl,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        customerMobilePhone: params.customerMobilePhone,
        card: {
          useEscrow: false,
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
    },
    [clientKey, customerKey]
  );

  useImperativeHandle(
    ref,
    () => ({
      requestPayment,
      ready,
    }),
    [requestPayment, ready]
  );

  return null;
});
