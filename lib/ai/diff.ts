/**
 * 단어 단위 diff 결과 세그먼트
 */
export type DiffSegmentType = "added" | "removed" | "unchanged";

export interface DiffSegment {
  type: DiffSegmentType;
  text: string;
}

/**
 * 두 텍스트를 단어 단위로 비교해 added/removed/unchanged 세그먼트 배열 반환
 */
export function diffText(oldText: string, newText: string): DiffSegment[] {
  const oldWords = oldText.trim().split(/\s+/).filter(Boolean);
  const newWords = newText.trim().split(/\s+/).filter(Boolean);

  const lcs = computeLCS(oldWords, newWords);
  const result: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  let k = 0;

  while (k < lcs.length) {
    while (i < oldWords.length && oldWords[i] !== lcs[k]) {
      result.push({ type: "removed", text: oldWords[i] });
      i++;
    }
    while (j < newWords.length && newWords[j] !== lcs[k]) {
      result.push({ type: "added", text: newWords[j] });
      j++;
    }
    if (k < lcs.length) {
      result.push({ type: "unchanged", text: lcs[k] });
      i++;
      j++;
      k++;
    }
  }
  while (i < oldWords.length) {
    result.push({ type: "removed", text: oldWords[i] });
    i++;
  }
  while (j < newWords.length) {
    result.push({ type: "added", text: newWords[j] });
    j++;
  }
  return result;
}

function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  const seq: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      seq.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return seq;
}
