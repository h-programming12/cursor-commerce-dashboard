"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { ADMIN_URLS } from "@/commons/constants/url";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export interface ProductActionResult {
  success: boolean;
  error?: string;
  data?: ProductRow;
}

type AdminUser = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "id" | "role"
>;

async function requireAdminSession(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: AdminUser | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, user: null };
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data || (data as AdminUser).role !== "admin") {
    return { supabase, user: null };
  }

  return { supabase, user: data as AdminUser };
}

export async function createProduct(
  formData: FormData
): Promise<ProductActionResult> {
  const { supabase, user } = await requireAdminSession();

  if (!user) {
    return {
      success: false,
      error: "관리자 권한이 필요합니다.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = formData.get("price");
  const salePriceRaw = formData.get("sale_price");
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const status = String(
    formData.get("status") ?? "registered"
  ) as ProductRow["status"];
  const categoriesRaw = String(formData.get("categories") ?? "").trim();
  const additionalInfo = String(formData.get("additional_info") ?? "").trim();
  const measurements = String(formData.get("measurements") ?? "").trim();

  const price = Number(priceRaw);
  const salePrice =
    salePriceRaw != null && String(salePriceRaw).trim() !== ""
      ? Number(salePriceRaw)
      : null;

  if (!name) {
    return { success: false, error: "상품명을 입력해 주세요." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return {
      success: false,
      error: "가격은 0 이상 숫자로 입력해 주세요.",
    };
  }
  if (
    salePrice != null &&
    (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= price)
  ) {
    return {
      success: false,
      error: "할인가는 정가보다 작은 0 이상 숫자여야 합니다.",
    };
  }

  const categories =
    categoriesRaw.length > 0
      ? categoriesRaw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : null;

  const payload: ProductInsert = {
    name,
    price,
    sale_price: salePrice,
    description: description || null,
    image_url: imageUrl || null,
    status: status ?? "registered",
    categories,
    additional_info: additionalInfo || null,
    measurements: measurements || null,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(payload as never)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "상품 생성에 실패했습니다.",
    };
  }

  revalidatePath(ADMIN_URLS.PRODUCTS);

  return {
    success: true,
    data: data as ProductRow,
  };
}

export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<ProductActionResult> {
  const { supabase, user } = await requireAdminSession();

  if (!user) {
    return {
      success: false,
      error: "관리자 권한이 필요합니다.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = formData.get("price");
  const salePriceRaw = formData.get("sale_price");
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const status = String(
    formData.get("status") ?? "registered"
  ) as ProductRow["status"];
  const categoriesRaw = String(formData.get("categories") ?? "").trim();
  const additionalInfo = String(formData.get("additional_info") ?? "").trim();
  const measurements = String(formData.get("measurements") ?? "").trim();

  const price = Number(priceRaw);
  const salePrice =
    salePriceRaw != null && String(salePriceRaw).trim() !== ""
      ? Number(salePriceRaw)
      : null;

  if (!name) {
    return { success: false, error: "상품명을 입력해 주세요." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return {
      success: false,
      error: "가격은 0 이상 숫자로 입력해 주세요.",
    };
  }
  if (
    salePrice != null &&
    (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= price)
  ) {
    return {
      success: false,
      error: "할인가는 정가보다 작은 0 이상 숫자여야 합니다.",
    };
  }

  const categories =
    categoriesRaw.length > 0
      ? categoriesRaw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : null;

  const payload: ProductUpdate = {
    name,
    price,
    sale_price: salePrice,
    description: description || null,
    image_url: imageUrl || null,
    status: status ?? "registered",
    categories,
    additional_info: additionalInfo || null,
    measurements: measurements || null,
  };

  const { data, error } = await supabase
    .from("products")
    .update(payload as never)
    .eq("id", productId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "상품 수정에 실패했습니다.",
    };
  }

  revalidatePath(ADMIN_URLS.PRODUCTS);
  revalidatePath(`${ADMIN_URLS.PRODUCTS}/${productId}`);

  return {
    success: true,
    data: data as ProductRow,
  };
}

export async function deleteProduct(
  productId: string
): Promise<ProductActionResult> {
  const { supabase, user } = await requireAdminSession();

  if (!user) {
    return {
      success: false,
      error: "관리자 권한이 필요합니다.",
    };
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    return {
      success: false,
      error: error.message ?? "상품 삭제에 실패했습니다.",
    };
  }

  revalidatePath(ADMIN_URLS.PRODUCTS);

  return {
    success: true,
  };
}
