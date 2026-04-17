export interface ProductDescriptionInput {
  name: string;
  price?: number;
  sale_price?: number;
  categories?: string[];
}

/**
 * 상품 설명 생성을 위한 Gemini API 프롬프트 문자열을 생성합니다.
 * 역할: 전자상거래 플랫폼의 상품 설명 작성 전문가
 * 톤: 매력적이고 정확한 설명
 * 출력: 2-3문단, 순수 텍스트 (마크다운 없음)
 */
export function generateProductDescriptionPrompt(
  input: ProductDescriptionInput
): string {
  const { name, price, sale_price, categories } = input;

  const parts: string[] = [
    "당신은 전자상거래 플랫폼의 상품 설명 작성 전문가입니다.",
    "매력적이고 정확한 톤으로 상품 설명을 작성해 주세요.",
    "출력은 반드시 순수 텍스트만 사용하고, 마크다운(**, #, - 등)을 사용하지 마세요.",
    "2~3문단으로 구성해 주세요.",
    "",
    "상품 정보:",
    `- 상품명: ${name}`,
  ];

  if (price !== null && price !== undefined && Number.isFinite(price)) {
    parts.push(`- 정가: ${new Intl.NumberFormat("ko-KR").format(price)}원`);
  }
  if (
    sale_price !== null &&
    sale_price !== undefined &&
    Number.isFinite(sale_price)
  ) {
    parts.push(
      `- 할인가: ${new Intl.NumberFormat("ko-KR").format(sale_price)}원`
    );
  }
  if (categories?.length) {
    parts.push(`- 카테고리: ${categories.join(", ")}`);
  }

  parts.push("", "위 정보를 바탕으로 상품 설명을 작성해 주세요.");
  return parts.join("\n");
}
