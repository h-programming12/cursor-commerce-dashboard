import { generateGeminiTextWithSystemPrompt } from "@/lib/ai/gemini";

/**
 * 리뷰 요약 결과 타입
 */
export interface ReviewSummaryResult {
  summary: string;
  positive_points: string[];
  negative_points: string[];
  keywords: string[];
}

/**
 * Gemini 응답 텍스트를 JSON으로 파싱하는 내부 헬퍼 함수
 */
function parseJSONResponse(text: string): ReviewSummaryResult {
  const trimmed = text.trim();

  // ```json ... ``` 또는 ``` ... ``` 형태의 코드 블록 제거
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "");

  try {
    const parsed = JSON.parse(withoutFence) as Partial<ReviewSummaryResult>;

    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.positive_points) ||
      !Array.isArray(parsed.negative_points) ||
      !Array.isArray(parsed.keywords)
    ) {
      throw new Error("필수 필드가 누락되었습니다.");
    }

    return {
      summary: parsed.summary,
      positive_points: parsed.positive_points,
      negative_points: parsed.negative_points,
      keywords: parsed.keywords,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[parseJSONResponse] JSON 파싱 실패:", error);
    // eslint-disable-next-line no-console
    console.error("[parseJSONResponse] 원본 텍스트:", text);
    throw error;
  }
}

/**
 * 기존 요약과 새 리뷰를 바탕으로 점진적 리뷰 요약을 생성합니다.
 *
 * @param existingSummary - 기존 리뷰 요약 결과 (없을 경우 null)
 * @param newReview - 새로 추가된 리뷰 정보
 * @returns 업데이트된 리뷰 요약 결과
 */
export async function generateIncrementalReviewSummary(
  existingSummary: ReviewSummaryResult | null,
  newReview: { rating: number; content: string }
): Promise<ReviewSummaryResult> {
  const systemPrompt = [
    "당신은 전자상거래 플랫폼의 리뷰 요약 전문가입니다.",
    "출력 형식은 반드시 아래 JSON 형식만 반환하세요. 마크다운이나 추가 설명은 절대 포함하지 마세요.",
    "{",
    '"summary": "전체 리뷰를 2-3줄로 요약한 텍스트",',
    '"positive_points": ["긍정적인 포인트 1", "긍정적인 포인트 2", ...],',
    '"negative_points": ["부정적인 포인트 1", "부정적인 포인트 2", ...],',
    '"keywords": ["키워드1", "키워드2", "키워드3"]',
    "}",
    "주의사항:",
    "- summary는 2-3줄로 간결하게 작성",
    "- positive_points, negative_points는 각각 최대 5개",
    "- keywords는 3-5개",
    "- 반드시 한글로 작성",
    "기존 요약과 새로운 리뷰를 결합하여 업데이트된 요약을 생성하세요.",
  ].join("\n");

  const existingSummaryText = existingSummary
    ? [
        "기존 요약:",
        `요약: ${existingSummary.summary}`,
        `긍정 포인트: ${existingSummary.positive_points.join(", ")}`,
        `부정 포인트: ${existingSummary.negative_points.join(", ")}`,
        `키워드: ${existingSummary.keywords.join(", ")}`,
      ].join("\n")
    : "기존 요약이 없습니다. 이것이 첫 번째 리뷰입니다.";

  const userPrompt = [
    existingSummaryText,
    "",
    "새 리뷰:",
    `별점: ${newReview.rating}/5`,
    `내용: ${newReview.content}`,
    "",
    "위 정보를 바탕으로 업데이트된 요약을 JSON 형식으로 생성해주세요.",
  ].join("\n");

  const responseText = await generateGeminiTextWithSystemPrompt(
    systemPrompt,
    userPrompt
  );

  return parseJSONResponse(responseText);
}

/**
 * 전체 리뷰 목록을 기반으로 종합 리뷰 요약을 생성합니다.
 *
 * @param reviews - 별점과 내용을 포함한 리뷰 배열
 * @returns 종합 리뷰 요약 결과
 * @throws 리뷰가 없을 경우 에러를 발생시킵니다.
 */
export async function generateFullReviewSummary(
  reviews: Array<{ rating: number; content: string }>
): Promise<ReviewSummaryResult> {
  if (reviews.length === 0) {
    throw new Error("리뷰가 없습니다.");
  }

  const systemPrompt = [
    "당신은 전자상거래 플랫폼의 리뷰 요약 전문가입니다.",
    "출력 형식은 반드시 아래 JSON 형식만 반환하세요. 마크다운이나 추가 설명은 절대 포함하지 마세요.",
    "{",
    '"summary": "전체 리뷰를 2-3줄로 요약한 텍스트",',
    '"positive_points": ["긍정적인 포인트 1", "긍정적인 포인트 2", ...],',
    '"negative_points": ["부정적인 포인트 1", "부정적인 포인트 2", ...],',
    '"keywords": ["키워드1", "키워드2", "키워드3"]',
    "}",
    "주의사항:",
    "- summary는 2-3줄로 간결하게 작성",
    "- positive_points, negative_points는 각각 최대 5개",
    "- keywords는 3-5개",
    "- 반드시 한글로 작성",
    "제공된 모든 리뷰를 분석하여 종합적인 요약을 생성하세요.",
  ].join("\n");

  const reviewsText = reviews
    .map((review, index) =>
      [
        `리뷰 ${index + 1}:`,
        `별점: ${review.rating}/5`,
        `내용: ${review.content}`,
      ].join("\n")
    )
    .join("\n\n");

  const userPrompt = [
    reviewsText,
    "",
    "위 리뷰들을 종합적으로 분석하여 요약을 JSON 형식으로 생성해주세요.",
  ].join("\n");

  const responseText = await generateGeminiTextWithSystemPrompt(
    systemPrompt,
    userPrompt
  );

  return parseJSONResponse(responseText);
}
