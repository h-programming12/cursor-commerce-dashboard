/**
 * Supabase auth.users와 public.users 연결 마이그레이션 실행 스크립트
 *
 * 이 스크립트는 Supabase Management API를 사용하여
 * auth.users와 public.users 테이블을 연결하는 마이그레이션을 실행합니다.
 *
 * 사용법:
 *   yarn db:auth-users-profile
 *
 * 환경변수:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
 *   - SUPABASE_ACCESS_TOKEN: Supabase Personal Access Token (필수)
 *     생성 방법: Supabase Dashboard > Settings > Access Tokens
 *
 * 참고: SUPABASE_SECRET_KEY (service_role key)는 Management API에서 사용할 수 없습니다.
 *       Personal Access Token이 필요합니다.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { getPublicEnv } from "../../commons/config/env";

// .env.local 파일 로드
// Next.js는 자동으로 .env.local을 로드하지만, 스크립트에서는 dotenv 사용
import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * Supabase URL에서 projectRef 추출
 * 예: https://xxxxx.supabase.co -> xxxxx
 */
function extractProjectRef(url: string): string {
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  if (!match || !match[1]) {
    throw new Error(
      `유효하지 않은 Supabase URL 형식입니다: ${url}\n예상 형식: https://xxxxx.supabase.co`
    );
  }
  return match[1];
}

/**
 * Supabase Management API를 사용하여 SQL 실행
 *
 * 참고: Management API는 Personal Access Token이 필요합니다.
 * Supabase Dashboard > Settings > Access Tokens에서 생성할 수 있습니다.
 */
async function executeSQL(
  projectRef: string,
  accessToken: string,
  sql: string
): Promise<void> {
  if (!accessToken) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN이 필요합니다.\n" +
        "Supabase Dashboard > Settings > Access Tokens에서 Personal Access Token을 생성하고\n" +
        ".env.local에 SUPABASE_ACCESS_TOKEN 환경변수를 추가하세요."
    );
  }

  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: sql,
    }),
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

  console.log("✅ 마이그레이션 실행 완료");
  if (result.data) {
    console.log("응답:", JSON.stringify(result.data, null, 2));
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log("🚀 auth.users와 public.users 연결 마이그레이션 시작...\n");

    // 환경변수 검증
    const env = getPublicEnv();
    const url = env.supabase.url;
    const projectRef = extractProjectRef(url);

    // Personal Access Token 확인 (필수)
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error(
        "SUPABASE_ACCESS_TOKEN 환경변수가 필요합니다.\n\n" +
          "생성 방법:\n" +
          "1. Supabase Dashboard (https://supabase.com/dashboard) 접속\n" +
          "2. Settings > Access Tokens 메뉴로 이동\n" +
          "3. 'Generate new token' 클릭하여 Personal Access Token 생성\n" +
          "4. 생성된 토큰을 .env.local 파일에 추가:\n" +
          "   SUPABASE_ACCESS_TOKEN=your_token_here\n\n" +
          "참고: SUPABASE_SECRET_KEY (service_role key)는 Management API에서 사용할 수 없습니다."
      );
    }

    console.log(`📦 프로젝트: ${projectRef}`);
    console.log(`🔑 Access Token: ${accessToken.substring(0, 10)}...\n`);

    // 마이그레이션 파일 읽기
    const migrationFile = join(
      process.cwd(),
      "supabase",
      "migrations",
      "0006_auth_users_profile.sql"
    );

    console.log(`📄 마이그레이션 파일: 0006_auth_users_profile.sql`);
    const sql = readFileSync(migrationFile, "utf-8");

    if (!sql.trim()) {
      throw new Error("마이그레이션 파일이 비어있습니다.");
    }

    await executeSQL(projectRef, accessToken, sql);
    console.log(`✅ 0006_auth_users_profile.sql 실행 완료\n`);

    console.log(
      "🎉 auth.users와 public.users 연결 마이그레이션이 성공적으로 완료되었습니다!"
    );
    console.log("\n📝 참고:");
    console.log(
      "   - 기존 users 테이블 데이터는 users_backup 테이블에 백업되었습니다."
    );
    console.log(
      "   - 마이그레이션 확인 후 필요시 users_backup 테이블을 수동으로 삭제할 수 있습니다."
    );
  } catch (error) {
    console.error("\n❌ 마이그레이션 실행 중 오류 발생:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    console.error(
      "\n💡 참고: 복구 불가능한 경우에만 Supabase SQL Editor에서 수동으로 실행하세요."
    );
    process.exit(1);
  }
}

main();
