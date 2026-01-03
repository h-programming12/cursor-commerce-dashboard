/**
 * Supabase 마이그레이션 실행 스크립트
 *
 * 이 스크립트는 Supabase Management API를 사용하여
 * SQL 마이그레이션 파일을 실행합니다.
 *
 * 사용법:
 *   yarn db:run-migration
 *
 * 환경변수:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
 *   - SUPABASE_ACCESS_TOKEN: Supabase Personal Access Token (필수)
 *     생성 방법: Supabase Dashboard > Settings > Access Tokens
 *   - SKIP_MIGRATIONS: 스킵할 마이그레이션 파일명 (쉼표로 구분)
 *     예: SKIP_MIGRATIONS=0001_init_schema.sql,0002_other.sql
 *
 * 참고: SUPABASE_SECRET_KEY (service_role key)는 Management API에서 사용할 수 없습니다.
 *       Personal Access Token이 필요합니다.
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { getPublicEnv } from "../commons/config/env";

// .env.local 파일 로드
// Next.js는 자동으로 .env.local을 로드하지만, 스크립트에서는 dotenv 사용
import { config } from "dotenv";
config({ path: ".env.local" });

interface MigrationFile {
  name: string;
  path: string;
}

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
 * 스킵할 마이그레이션 파일 목록 가져오기
 */
function getSkippedMigrations(): Set<string> {
  const skipEnv = process.env.SKIP_MIGRATIONS;
  if (!skipEnv) {
    return new Set();
  }

  return new Set(
    skipEnv
      .split(",")
      .map((file) => file.trim())
      .filter((file) => file.length > 0)
  );
}

/**
 * 마이그레이션 파일 목록 가져오기
 * 파일명 순서대로 정렬하여 실행
 * SKIP_MIGRATIONS 환경변수로 지정된 파일은 제외
 */
function getMigrationFiles(): MigrationFile[] {
  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const skippedMigrations = getSkippedMigrations();

  const files = readdirSync(migrationsDir)
    .filter((file: string) => file.endsWith(".sql"))
    .filter((file: string) => !skippedMigrations.has(file))
    .sort() // 파일명 순서대로 정렬
    .map((file: string) => ({
      name: file,
      path: join(migrationsDir, file),
    }));

  return files;
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log("🚀 Supabase 마이그레이션 시작...\n");

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
    console.log(`🔑 Access Token: ${accessToken.substring(0, 10)}...`);

    // 스킵할 마이그레이션 확인
    const skippedMigrations = getSkippedMigrations();
    if (skippedMigrations.size > 0) {
      console.log(
        `⏭️  스킵할 마이그레이션: ${Array.from(skippedMigrations).join(", ")}`
      );
    }
    console.log();

    // 마이그레이션 파일 읽기
    const migrationFiles = getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log("⚠️  실행할 마이그레이션 파일이 없습니다.");
      console.log(
        "   (모든 파일이 스킵되었거나 마이그레이션 파일이 없습니다.)"
      );
      return;
    }

    for (const migration of migrationFiles) {
      console.log(`📄 마이그레이션 파일: ${migration.name}`);
      const sql = readFileSync(migration.path, "utf-8");

      if (!sql.trim()) {
        console.warn(`⚠️  경고: ${migration.name} 파일이 비어있습니다.`);
        continue;
      }

      await executeSQL(projectRef, accessToken, sql);
      console.log(`✅ ${migration.name} 실행 완료\n`);
    }

    console.log("🎉 모든 마이그레이션이 성공적으로 완료되었습니다!");
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
