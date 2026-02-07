/**
 * users UPDATE 정책 무한 재귀 수정
 *
 * 프로필 수정 시 WITH CHECK 서브쿼리로 인한 무한 재귀(42P17) 해결.
 * - is_admin() 소유자를 users 테이블 소유자로 맞춰 RLS 우회
 * - 본인 role 변경 방지를 트리거로 이전
 * - UPDATE 정책에서 users를 읽는 서브쿼리 제거
 *
 * 사용법:
 *   yarn db:fix-users-update-policy-recursion
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
    console.log("🚀 users UPDATE 정책 무한 재귀 수정 마이그레이션 실행...\n");
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
      "0009_fix_users_update_policy_recursion.sql"
    );
    const sql = readFileSync(migrationPath, "utf-8");
    if (!sql.trim()) {
      throw new Error("마이그레이션 파일이 비어있습니다.");
    }
    await executeSQL(projectRef, accessToken, sql);
    console.log("✅ 0009_fix_users_update_policy_recursion.sql 실행 완료\n");
    console.log("🎉 프로필 이름 수정 시 무한 재귀 오류가 해결되었습니다.");
  } catch (error) {
    console.error("\n❌ 마이그레이션 실행 중 오류:");
    if (error instanceof Error) console.error(error.message);
    else console.error(error);
    process.exit(1);
  }
}

main();
