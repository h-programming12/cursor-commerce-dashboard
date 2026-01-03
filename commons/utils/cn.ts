// className 유틸리티 함수
// clsx, tailwind-merge 패키지 설치 후 구현 예정
export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(" ");
}
