/**
 * 숫자를 원화 형식으로 포맷팅합니다.
 * @param price - 포맷팅할 가격 (숫자)
 * @returns 포맷팅된 가격 문자열 (예: "199,000원")
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}
