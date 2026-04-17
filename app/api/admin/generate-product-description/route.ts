import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { generateGeminiText } from "@/lib/ai/gemini";
import {
  generateProductDescriptionPrompt,
  type ProductDescriptionInput,
} from "@/lib/ai/prompts/product-description";

type RequestBody = {
  name: string;
  price?: number;
  sale_price?: number;
  categories?: string[];
};

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: "관리자 권한이 필요합니다." },
      { status: 403 }
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { success: false, error: "상품명(name)이 필요합니다." },
      { status: 400 }
    );
  }

  const input: ProductDescriptionInput = {
    name,
    price:
      body.price !== null &&
      body.price !== undefined &&
      Number.isFinite(Number(body.price))
        ? Number(body.price)
        : undefined,
    sale_price:
      body.sale_price !== null &&
      body.sale_price !== undefined &&
      Number.isFinite(Number(body.sale_price))
        ? Number(body.sale_price)
        : undefined,
    categories:
      Array.isArray(body.categories) &&
      body.categories.every((c) => typeof c === "string")
        ? body.categories
        : undefined,
  };

  try {
    const prompt = generateProductDescriptionPrompt(input);
    const description = await generateGeminiText(prompt);
    const trimmed = description.trim();
    return NextResponse.json({
      success: true,
      description: trimmed || undefined,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "상품 설명 생성에 실패했습니다.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
