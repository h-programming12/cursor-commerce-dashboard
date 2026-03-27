/**
 * Notion 페이지 URL 끝의 32/36자리 ID를 추출하고, 하이픈을 제거한 32자리 소문자 hex를 반환합니다.
 */
export function extractPageId(url: string): string | null {
  const cleaned = url.trim().split("?")[0]?.replace(/\/+$/, "") ?? "";
  const match = cleaned.match(/([a-f0-9]{32}|[a-f0-9-]{36})$/i);
  if (!match) {
    return null;
  }
  return match[1].replace(/-/g, "").toLowerCase();
}

/**
 * Notion 페이지 표준 웹 URL (하이픈 포함 UUID 형식)을 반환합니다.
 */
export function formatPageUrl(id: string): string {
  const clean = id.replace(/-/g, "").toLowerCase();
  if (clean.length !== 32 || !/^[a-f0-9]{32}$/.test(clean)) {
    return `https://www.notion.so/${id}`;
  }
  const hyphenated = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(
    12,
    16
  )}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
  return `https://www.notion.so/${hyphenated}`;
}
