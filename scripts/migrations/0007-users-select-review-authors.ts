/**
 * 리뷰 작성자 프로필 공개 조회 RLS 정책 마이그레이션
 *
 * 리뷰 목록에서 users(display_name) 조인 시 작성자 display_name이 표시되도록
 * users 테이블에 SELECT 정책을 추가합니다.
 *
 * 사용법:
 *   yarn db:users-select-review-authors
 *
 * 환경변수:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
 *   - SUPABASE_ACCESS_TOKEN: Supabase Personal Access Token (필수)
 */

import { readFileSync } from "fs";
import { join } from "path";
import { getPublicEnv } from "../../commons/config/env";
import { config } from "dotenv";
config({ path: ".env.local" });

function extractProjectRef(url: string): string {
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  if (!match || !match[1]) {
    throw new Error(
      `유효하지 않은 Supabase URL 형식입니다: ${url}\n예상 형식: https://xxxxx.supabase.co`
    );
  }
  return match[1];
}

async function executeSQL(
  projectRef: string,
  accessToken: string,
  sql: string
): Promise<void> {
  if (!accessToken) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN이 필요합니다. .env.local에 설정하세요."
    );
  }
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `마이그레이션 실행 실패 (${response.status}): ${errorText}`
    );
  }
  const result = await response.json();
  if (result.error) {
    throw new Error(`마이그레이션 실행 실패: ${result.error}`);
  }
}

async function main() {
  try {
    console.log("🚀 리뷰 작성자 프로필 조회 정책 마이그레이션 시작...\n");
    const env = getPublicEnv();
    const projectRef = extractProjectRef(env.supabase.url);
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error(
        "SUPABASE_ACCESS_TOKEN이 필요합니다. Supabase Dashboard > Settings > Access Tokens에서 생성 후 .env.local에 추가하세요."
      );
    }
    const migrationPath = join(
      process.cwd(),
      "supabase",
      "migrations",
      "0007_users_select_review_authors.sql"
    );
    const sql = readFileSync(migrationPath, "utf-8");
    if (!sql.trim()) {
      throw new Error("마이그레이션 파일이 비어있습니다.");
    }
    await executeSQL(projectRef, accessToken, sql);
    console.log("✅ 0007_users_select_review_authors.sql 실행 완료\n");
    console.log("🎉 리뷰 목록에서 작성자 display_name이 정상 표시됩니다.");
  } catch (error) {
    console.error("\n❌ 마이그레이션 실행 중 오류:");
    if (error instanceof Error) console.error(error.message);
    else console.error(error);
    process.exit(1);
  }
}

main();
