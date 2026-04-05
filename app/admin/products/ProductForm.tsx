"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import type { ProductDetail } from "@/app/admin/queries";
import { ADMIN_URLS } from "@/commons/constants/url";
import {
  createProduct,
  updateProduct,
  type ProductActionResult,
} from "./product-actions";

type Mode = "create" | "edit";

interface ProductFormProps {
  mode: Mode;
  product?: ProductDetail;
}

const STATUS_OPTIONS = [
  { value: "registered", label: "판매중" },
  { value: "hidden", label: "숨김" },
  { value: "sold_out", label: "품절" },
];

interface FormState {
  name: string;
  price: string;
  sale_price: string;
  description: string;
  image_url: string;
  status: string;
  categories: string;
  additional_info: string;
  measurements: string;
}

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    product?.image_url ?? ""
  );

  const [aiDescriptionLoading, setAiDescriptionLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: product?.name ?? "",
    price: product ? String(product.price) : "",
    sale_price:
      product && product.sale_price != null ? String(product.sale_price) : "",
    description: product?.description ?? "",
    image_url: product?.image_url ?? "",
    status: product?.status ?? "registered",
    categories: product?.categories?.join(", ") ?? "",
    additional_info: "",
    measurements: "",
  });

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "image_url") {
      setPreviewUrl(String(value));
    }
  }

  async function handleGenerateAiDescription() {
    const name = form.name.trim();
    if (!name) return;
    setAiDescriptionLoading(true);
    try {
      const price = form.price.trim() ? Number(form.price) : undefined;
      const salePrice = form.sale_price.trim()
        ? Number(form.sale_price)
        : undefined;
      const categories = form.categories.trim()
        ? form.categories
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : undefined;
      const res = await fetch("/api/admin/generate-product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          sale_price: salePrice,
          categories,
        }),
      });
      const data = (await res.json()) as {
        success: boolean;
        description?: string;
        error?: string;
      };
      if (data.success && typeof data.description === "string") {
        handleChange("description", data.description);
      } else {
        alert(data.error ?? "상품 설명 생성에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setAiDescriptionLoading(false);
    }
  }

  function validate() {
    if (!form.name.trim()) {
      return "상품명을 입력해 주세요.";
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      return "가격은 0 이상 숫자로 입력해 주세요.";
    }
    if (form.sale_price.trim()) {
      const salePrice = Number(form.sale_price);
      if (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= price) {
        return "할인가는 정가보다 작은 0 이상 숫자여야 합니다.";
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.set("name", form.name.trim());
    formData.set("price", form.price.trim());
    formData.set("sale_price", form.sale_price.trim());
    formData.set("description", form.description.trim());
    formData.set("image_url", form.image_url.trim());
    formData.set("status", form.status);
    formData.set("categories", form.categories.trim());
    formData.set("additional_info", form.additional_info.trim());
    formData.set("measurements", form.measurements.trim());

    let result: ProductActionResult;
    if (mode === "create") {
      result = await createProduct(formData);
    } else if (product) {
      result = await updateProduct(product.id, formData);
    } else {
      return;
    }

    if (!result.success) {
      setError(result.error ?? "요청 처리에 실패했습니다.");
      return;
    }

    startTransition(() => {
      router.push(
        result.data
          ? `${ADMIN_URLS.PRODUCTS}/${result.data.id}`
          : ADMIN_URLS.PRODUCTS
      );
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6"
      style={{
        padding: "var(--admin-padding-lg)",
        borderRadius: "8px",
        backgroundColor: "var(--admin-background-default)",
        border: "1px solid var(--admin-border-default)",
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          variant="admin"
          label="상품명"
          name="name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="상품명을 입력하세요"
          required
        />
        <div className="w-full">
          <label
            className="block mb-2 text-xs font-bold"
            style={{
              color: "var(--admin-text-tertiary)",
              fontSize: "12px",
              lineHeight: "12px",
            }}
          >
            판매 상태
          </label>
          <Dropdown
            options={STATUS_OPTIONS}
            value={form.status}
            onValueChange={(v) => handleChange("status", v)}
            placeholder="판매 상태를 선택하세요"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          variant="admin"
          label="정가"
          name="price"
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
          placeholder="0"
          required
        />
        <Input
          variant="admin"
          label="할인가"
          name="sale_price"
          type="number"
          min={0}
          value={form.sale_price}
          onChange={(e) => handleChange("sale_price", e.target.value)}
          placeholder="미입력 시 정가만 사용"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_minmax(0,1fr)]">
        <div className="grid gap-4">
          <div>
            <div
              className="mb-2 flex items-center gap-2 flex-wrap"
              style={{ fontFamily: "var(--admin-font-public-sans)" }}
            >
              <label
                className="text-xs font-bold"
                style={{
                  color: "var(--admin-text-tertiary)",
                  fontSize: "12px",
                  lineHeight: "12px",
                }}
              >
                설명
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={!form.name.trim() || aiDescriptionLoading}
                className="rounded px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "var(--admin-font-public-sans)",
                  fontSize: "12px",
                  ...(form.name.trim() && !aiDescriptionLoading
                    ? {
                        backgroundColor: "var(--admin-primary-main)",
                        color: "var(--admin-text-inverse)",
                      }
                    : {
                        backgroundColor: "var(--admin-grey-g75)",
                        color: "var(--admin-text-inverse)",
                      }),
                }}
              >
                {aiDescriptionLoading
                  ? "✨ AI 설명 생성 중..."
                  : "✨ AI 설명 추가하기"}
              </button>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="w-full rounded border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                borderColor: "var(--admin-border-default)",
                backgroundColor: "var(--admin-background-default)",
                color: "var(--admin-text-primary)",
                fontFamily: "var(--admin-font-public-sans)",
              }}
            />
          </div>

          <Input
            variant="admin"
            label="카테고리"
            name="categories"
            value={form.categories}
            onChange={(e) => handleChange("categories", e.target.value)}
            placeholder="쉼표(,)로 구분하여 입력"
          />

          <Input
            variant="admin"
            label="추가 정보"
            name="additional_info"
            value={form.additional_info}
            onChange={(e) => handleChange("additional_info", e.target.value)}
            placeholder="추가 정보를 입력하세요"
          />

          <Input
            variant="admin"
            label="사이즈/치수"
            name="measurements"
            value={form.measurements}
            onChange={(e) => handleChange("measurements", e.target.value)}
            placeholder="예: 가로 20cm, 세로 10cm"
          />
        </div>

        <div className="grid gap-3">
          <Input
            variant="admin"
            label="이미지 URL"
            name="image_url"
            value={form.image_url}
            onChange={(e) => handleChange("image_url", e.target.value)}
            placeholder="상품 이미지 URL을 입력하세요"
          />
          <div
            className="flex items-center justify-center overflow-hidden rounded border"
            style={{
              borderColor: "var(--admin-border-default)",
              backgroundColor: "var(--admin-background-light)",
              minHeight: "180px",
            }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="상품 이미지 미리보기"
                className="max-h-64 max-w-full object-contain"
              />
            ) : (
              <span
                style={{
                  fontSize: "var(--admin-text-sm)",
                  color: "var(--admin-text-tertiary)",
                  fontFamily: "var(--admin-font-public-sans)",
                }}
              >
                이미지 URL을 입력하면 미리보기가 표시됩니다.
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          style={{
            color: "var(--admin-semantic-error)",
            fontSize: "var(--admin-text-sm)",
            fontFamily: "var(--admin-font-public-sans)",
          }}
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(ADMIN_URLS.PRODUCTS)}
          className="px-4 py-2 rounded border bg-transparent text-sm"
          style={{
            borderColor: "var(--admin-border-default)",
            color: "var(--admin-text-secondary)",
            fontFamily: "var(--admin-font-public-sans)",
          }}
          disabled={isPending}
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: "var(--admin-primary-main)",
            color: "var(--admin-text-inverse)",
            fontFamily: "var(--admin-font-public-sans)",
          }}
          disabled={isPending}
        >
          {mode === "create" ? "상품 등록" : "상품 수정"}
        </button>
      </div>
    </form>
  );
}
