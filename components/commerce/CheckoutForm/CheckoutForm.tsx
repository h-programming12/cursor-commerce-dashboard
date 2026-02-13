"use client";

import React, { useRef, useState } from "react";
import { Input } from "@/components/ui";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import {
  OrderSummary,
  type OrderSummaryLineItem,
} from "@/components/commerce/OrderSummary";
import {
  TossPayment,
  type TossPaymentHandle,
} from "@/components/commerce/TossPayment";
import { HiOutlineCreditCard } from "react-icons/hi2";

export interface CheckoutFormDefaultUser {
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  shippingName?: string | null;
  shippingPhone?: string | null;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingZip?: string | null;
  shippingCountry?: string | null;
}

export interface CheckoutOrderResult {
  orderId: string;
  tossOrderId: string;
}

export interface CheckoutFormProps {
  defaultUser: CheckoutFormDefaultUser;
  lineItems: OrderSummaryLineItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  serverSubtotal: number;
  serverShippingFee: number;
  serverDiscount: number;
  serverTotal: number;
  onSubmit: (values: CheckoutFormValues) => Promise<CheckoutOrderResult | void>;
  tossClientKey?: string;
}

export interface CheckoutFormValues {
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  contactEmail: string;
  shippingAddressLine1: string;
  shippingCountry: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  useDifferentBilling: boolean;
}

/** 한글 이름: 맨 앞 글자 = 성, 나머지 = 이름. [firstName(이름), lastName(성)] */
const splitDisplayName = (
  name: string | null | undefined
): [string, string] => {
  const trimmed = name?.trim() ?? "";
  if (!trimmed) return ["", ""];
  const firstChar = trimmed[0] ?? "";
  const rest = trimmed.slice(1).trim();
  return [rest, firstChar];
};

function buildOrderName(lineItems: OrderSummaryLineItem[]): string {
  if (lineItems.length === 0) return "주문 결제";
  const first = lineItems[0];
  if (lineItems.length === 1) return first.productName;
  return `${first.productName} 외 ${lineItems.length - 1}건`;
}

export function CheckoutForm({
  defaultUser,
  lineItems,
  subtotal,
  shippingFee,
  discount,
  total,
  serverSubtotal,
  serverShippingFee,
  serverDiscount,
  serverTotal,
  onSubmit,
  tossClientKey,
}: CheckoutFormProps) {
  const tossPaymentRef = useRef<TossPaymentHandle>(null);
  const [firstName, lastName] = splitDisplayName(defaultUser.contactName);

  const [contactFirstName, setContactFirstName] = useState(firstName);
  const [contactLastName, setContactLastName] = useState(lastName);
  const [contactPhone, setContactPhone] = useState(
    defaultUser.contactPhone ?? ""
  );
  const [contactEmail, setContactEmail] = useState(
    defaultUser.contactEmail ?? ""
  );
  const [shippingAddressLine1, setShippingAddressLine1] = useState(
    defaultUser.shippingAddressLine1 ?? ""
  );
  const [shippingCountry, setShippingCountry] = useState(
    defaultUser.shippingCountry ?? ""
  );
  const [shippingCity, setShippingCity] = useState(
    defaultUser.shippingCity ?? ""
  );
  const [shippingState, setShippingState] = useState(
    defaultUser.shippingState ?? ""
  );
  const [shippingZip, setShippingZip] = useState(defaultUser.shippingZip ?? "");
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!contactFirstName.trim())
      next.contactFirstName = "First name is required.";
    if (!contactLastName.trim())
      next.contactLastName = "Last name is required.";
    if (!contactPhone.trim()) next.contactPhone = "Phone number is required.";
    if (!contactEmail.trim()) next.contactEmail = "Email is required.";
    if (!shippingAddressLine1.trim())
      next.shippingAddressLine1 = "Street address is required.";
    if (!shippingCountry.trim()) next.shippingCountry = "Country is required.";
    if (!shippingCity.trim()) next.shippingCity = "Town / City is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const clientTotal = Math.round(subtotal) + shippingFee - discount;
    if (Math.abs(clientTotal - total) > 1) {
      setErrors({
        form: "가격 정보가 변경되었습니다. 페이지를 새로고침 후 다시 시도해 주세요.",
      });
      return;
    }

    if (
      Math.abs(serverSubtotal - Math.round(subtotal)) > 1 ||
      serverShippingFee !== shippingFee ||
      Math.abs(serverTotal - total) > 1
    ) {
      setErrors({
        form: "서버와 금액이 일치하지 않습니다. 새로고침 후 다시 시도해 주세요.",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: "" }));

    try {
      const result = await onSubmit({
        contactFirstName,
        contactLastName,
        contactPhone,
        contactEmail,
        shippingAddressLine1,
        shippingCountry,
        shippingCity,
        shippingState,
        shippingZip,
        useDifferentBilling,
      });

      if (result && tossClientKey && typeof window !== "undefined") {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("pendingOrderId", result.orderId);
        }
        const payment = tossPaymentRef.current;
        if (!payment?.ready) {
          setErrors({
            form: "결제창을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.",
          });
          return;
        }
        const origin = window.location.origin;
        await payment.requestPayment({
          tossOrderId: result.tossOrderId,
          amount: total,
          orderName: buildOrderName(lineItems),
          customerEmail: contactEmail,
          customerName:
            [contactLastName, contactFirstName].filter(Boolean).join(" ") ||
            "구매자",
          customerMobilePhone: contactPhone || undefined,
          successUrl: `${origin}/checkout/success`,
          failUrl: `${origin}/checkout/fail`,
        });
      }
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : "주문 처리 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionBorder = `1px solid ${commerceColors.neutral["04"]["100"]}`;
  const sectionStyle: React.CSSProperties = {
    border: sectionBorder,
    borderRadius: "4px",
    padding: "24px 24px 40px",
    marginBottom: "24px",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: commerceTypography.caption["2-bold"].fontFamily,
    fontWeight: commerceTypography.caption["2-bold"].fontWeight,
    fontSize: "12px",
    lineHeight: "12px",
    color: commerceColors.text.tertiary,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: commerceTypography.headline.h7.fontFamily,
    fontWeight: commerceTypography.headline.h7.fontWeight,
    fontSize: "20px",
    lineHeight: "28px",
    color: commerceColors.text.primary,
    marginBottom: "24px",
  };

  return (
    <>
      {tossClientKey && (
        <TossPayment ref={tossPaymentRef} clientKey={tossClientKey} />
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-8 lg:gap-12"
      >
        <div className="flex-1 min-w-0 space-y-6">
          {/* Contact Information */}
          <section style={sectionStyle} aria-labelledby="contact-heading">
            <h2 id="contact-heading" style={sectionTitleStyle}>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <Input
                variant="commerce"
                label="First Name"
                placeholder="First name"
                value={contactFirstName}
                onChange={(e) => setContactFirstName(e.target.value)}
                error={!!errors.contactFirstName}
                helperText={errors.contactFirstName}
                aria-required
              />
              <Input
                variant="commerce"
                label="Last Name"
                placeholder="Last name"
                value={contactLastName}
                onChange={(e) => setContactLastName(e.target.value)}
                error={!!errors.contactLastName}
                helperText={errors.contactLastName}
                aria-required
              />
            </div>
            <div className="mb-6">
              <Input
                variant="commerce"
                label="Phone Number"
                placeholder="Phone number"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                error={!!errors.contactPhone}
                helperText={errors.contactPhone}
                aria-required
              />
            </div>
            <Input
              variant="commerce"
              label="Email address"
              placeholder="Your Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail}
              aria-required
            />
          </section>

          {/* Shipping Address */}
          <section style={sectionStyle} aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" style={sectionTitleStyle}>
              Shipping Address
            </h2>
            <div className="mb-6">
              <Input
                variant="commerce"
                label="Street Address *"
                placeholder="Street Address"
                value={shippingAddressLine1}
                onChange={(e) => setShippingAddressLine1(e.target.value)}
                error={!!errors.shippingAddressLine1}
                helperText={errors.shippingAddressLine1}
                aria-required
              />
            </div>
            <div className="mb-6">
              <Input
                variant="commerce"
                label="Country *"
                placeholder="Country"
                value={shippingCountry}
                onChange={(e) => setShippingCountry(e.target.value)}
                error={!!errors.shippingCountry}
                helperText={errors.shippingCountry}
                aria-required
              />
            </div>
            <div className="mb-6">
              <Input
                variant="commerce"
                label="Town / City *"
                placeholder="Town / City"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                error={!!errors.shippingCity}
                helperText={errors.shippingCity}
                aria-required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <Input
                variant="commerce"
                label="State"
                placeholder="State"
                value={shippingState}
                onChange={(e) => setShippingState(e.target.value)}
              />
              <Input
                variant="commerce"
                label="Zip Code"
                placeholder="Zip Code"
                value={shippingZip}
                onChange={(e) => setShippingZip(e.target.value)}
              />
            </div>
            <label
              className="flex items-center gap-3 cursor-pointer"
              style={{
                fontFamily: commerceTypography.body["2"].fontFamily,
                fontWeight: commerceTypography.body["2"].fontWeight,
                fontSize: "16px",
                lineHeight: "26px",
                color: commerceColors.text.tertiary,
              }}
            >
              <input
                type="checkbox"
                checked={useDifferentBilling}
                onChange={(e) => setUseDifferentBilling(e.target.checked)}
                className="w-6 h-6 rounded border shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  borderColor: commerceColors.neutral["04"]["100"],
                  accentColor: commerceColors.neutral["07"]["100"],
                }}
                aria-label="Use a different billing address"
              />
              Use a different billing address (optional)
            </label>
          </section>

          {/* Payment method */}
          <section style={sectionStyle} aria-labelledby="payment-heading">
            <h2 id="payment-heading" style={sectionTitleStyle}>
              Payment method
            </h2>
            <div
              className="flex items-center justify-between w-full p-4 rounded"
              style={{
                backgroundColor: commerceColors.background.light,
                border: `1px solid ${commerceColors.neutral["07"]["100"]}`,
                borderRadius: "4px",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: commerceColors.neutral["07"]["100"],
                    backgroundColor: commerceColors.neutral["07"]["100"],
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: commerceColors.background.default,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: commerceTypography.body["2"].fontFamily,
                    fontWeight: commerceTypography.body["2"].fontWeight,
                    fontSize: "16px",
                    lineHeight: "26px",
                    color: commerceColors.text.primary,
                  }}
                >
                  Pay by Toss Payments
                </span>
              </div>
              <HiOutlineCreditCard
                size={24}
                style={{ color: commerceColors.text.primary }}
                aria-hidden
              />
            </div>
          </section>

          {errors.form && (
            <p
              role="alert"
              className="py-2"
              style={{
                fontFamily: commerceTypography.body["2"].fontFamily,
                fontSize: "16px",
                lineHeight: "26px",
                color: commerceColors.semantic.error,
              }}
            >
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full transition-colors hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141718]"
            style={{
              height: "52px",
              borderRadius: "8px",
              backgroundColor: commerceColors.neutral["07"]["100"],
              color: commerceColors.text.inverse,
              fontFamily: commerceTypography.button.s.fontFamily,
              fontWeight: commerceTypography.button.s.fontWeight,
              fontSize: "16px",
              lineHeight: "28px",
              letterSpacing: "-0.4px",
            }}
          >
            {isSubmitting ? "처리 중..." : "Place Order"}
          </button>
        </div>

        <aside className="lg:w-[413px] shrink-0">
          <div className="sticky top-24">
            <OrderSummary
              lineItems={lineItems}
              subtotal={subtotal}
              shippingFee={shippingFee}
              discount={discount}
              total={total}
            />
          </div>
        </aside>
      </form>
    </>
  );
}
