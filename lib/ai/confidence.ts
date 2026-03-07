/**
 * 신뢰도 계산에 사용하는 요인
 */
export interface ConfidenceFactors {
  /** 리뷰 개수 (많을수록 유리, 0~1 정규화 권장) */
  reviewCount: number;
  /** 별점 일관성 (분산의 역수 등, 0~1) */
  ratingVariance: number;
  /** 평균 리뷰 길이 정규화 (0~1) */
  averageReviewLength: number;
  /** 요약 안정성 (0~1) */
  summaryStability: number;
}

/**
 * 리뷰 개수(40%), 별점 일관성(20%), 평균 리뷰 길이(20%), 요약 안정성(20%)로 0~1 점수 계산
 */
export function calculateConfidence(factors: ConfidenceFactors): number {
  const { reviewCount, ratingVariance, averageReviewLength, summaryStability } =
    factors;
  const score =
    reviewCount * 0.4 +
    ratingVariance * 0.2 +
    averageReviewLength * 0.2 +
    summaryStability * 0.2;
  return Math.max(0, Math.min(1, score));
}

export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * 0.7 이상 high / 0.4~0.69 medium / 미만 low
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.7) return "high";
  if (confidence >= 0.4) return "medium";
  return "low";
}
