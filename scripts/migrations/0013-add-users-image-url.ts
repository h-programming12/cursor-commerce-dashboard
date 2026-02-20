/**
 * public.users 테이블에 image_url 컬럼 추가 마이그레이션 실행 스크립트
 *
 * 이 스크립트는 Supabase Management API를 사용하여
 * public.users 테이블에 image_url 컬럼을 추가합니다.
 *
 * 사용법:
 *   yarn db:add-users-image-url
 *
 * 환경변수:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
 *   - SUPABASE_ACCESS_TOKEN: Supabase Personal Access Token (필수)
 *     생성 방법: Supabase Dashboard > Settings > Access Tokens
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
    let errorMessage = `마이그레이션 실행 실패 (${response.status}): ${errorText}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.message) {
        errorMessage = `마이그레이션 실행 실패 (${response.status}): ${errorJson.message}`;
      }
      if (errorJson.error) {
        errorMessage = `마이그레이션 실행 실패 (${response.status}): ${errorJson.error}`;
      }
    } catch {
      // JSON 파싱 실패 시 원본 텍스트 사용
    }
    throw new Error(errorMessage);
  }
  const result = await response.json();
  if (result.error) {
    throw new Error(`마이그레이션 실행 실패: ${result.error}`);
  }
}

async function main() {
  try {
    console.log(
      "🚀 public.users 테이블에 image_url 컬럼 추가 마이그레이션 실행...\n"
    );
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
      "0013_add_users_image_url.sql"
    );
    const sql = readFileSync(migrationPath, "utf-8");
    if (!sql.trim()) {
      throw new Error("마이그레이션 파일이 비어있습니다.");
    }
    await executeSQL(projectRef, accessToken, sql);
    console.log("✅ 0013_add_users_image_url.sql 실행 완료\n");
    console.log(
      "🎉 public.users 테이블에 image_url 컬럼이 성공적으로 추가되었습니다."
    );
  } catch (error) {
    console.error("\n❌ 마이그레이션 실행 중 오류:");
    if (error instanceof Error) console.error(error.message);
    else console.error(error);
    console.error(
      "\n💡 참고: 복구 불가능한 경우에만 Supabase SQL Editor에서 수동으로 실행하세요."
    );
    process.exit(1);
  }
}

main();
