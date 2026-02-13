/**
 * orders 테이블: 본인 주문 결제 상태 업데이트 허용 정책 추가
 *
 * 결제 승인/실패 시 주문 소유자가 해당 주문을 UPDATE할 수 있도록
 * orders_update_own_for_payment 정책을 생성합니다.
 *
 * 사용법:
 *   yarn db:allow-orders-update-own-for-payment
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
    console.log(
      "🚀 orders UPDATE 본인 주문(결제 상태) 허용 정책 마이그레이션 실행...\n"
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
      "0012_allow_orders_update_own_for_payment.sql"
    );
    const sql = readFileSync(migrationPath, "utf-8");
    if (!sql.trim()) {
      throw new Error("마이그레이션 파일이 비어있습니다.");
    }
    await executeSQL(projectRef, accessToken, sql);
    console.log("✅ 0012_allow_orders_update_own_for_payment.sql 실행 완료\n");
    console.log(
      "🎉 결제 승인/실패 시 본인 주문의 orders UPDATE가 허용되었습니다."
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
