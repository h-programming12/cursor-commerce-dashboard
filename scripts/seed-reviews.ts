/**
 * 사용자/리뷰 데이터 Seed 스크립트
 *
 * - 최소 30명 사용자 보장 후, registered 상품 최대 20개에 리뷰 생성
 * - 상품당 3~15개 랜덤 리뷰, 별점 분포·중복 방지·날짜 분산 적용
 *
 * 사용법:
 *   yarn db:seed-reviews
 *
 * 환경변수:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SECRET_KEY (필수)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { getServerEnv } from "../commons/config/env";
import type { Database } from "../types/supabase";

config({ path: ".env.local" });

type UserInsert = {
  id?: string;
  email: string;
  display_name?: string | null;
  role?: "user" | "admin";
  created_at?: string | null;
  updated_at?: string | null;
};

type ReviewInsert = {
  id?: string;
  user_id: string;
  product_id: string;
  rating: number;
  content?: string | null;
  created_at?: string | null;
};

type ExtendedDatabase = Database & {
  public: Database["public"] & {
    Tables: Database["public"]["Tables"] & {
      users: { Row: { id: string }; Insert: UserInsert; Update: unknown };
      reviews: { Row: unknown; Insert: ReviewInsert; Update: unknown };
    };
  };
};

const BATCH_SIZE = 10;
const MIN_USERS = 30;
const MAX_PRODUCTS_FOR_REVIEWS = 20;
const MIN_REVIEWS_PER_PRODUCT = 3;
const MAX_REVIEWS_PER_PRODUCT = 15;
const DAYS_AGO_MIN = 1;
const DAYS_AGO_MAX = 180;

const RATING_WEIGHTS = [
  { rating: 1, weight: 10 },
  { rating: 2, weight: 10 },
  { rating: 3, weight: 10 },
  { rating: 4, weight: 40 },
  { rating: 5, weight: 30 },
];

const REVIEW_CONTENTS = [
  "배송 빨라요. 만족합니다.",
  "가성비 좋아요. 추천해요.",
  "품질 괜찮아요.",
  "생각보다 괜찮네요. 다음에도 구매할게요.",
  "디자인 예쁘고 실용적이에요.",
  "친절한 안내 감사합니다.",
  "포장 꼼꼼해요.",
  "사용하기 편해요.",
  "기대 이상이에요.",
  "적당한 가격에 만족해요.",
  "설명대로예요.",
  "잘 쓸게요.",
  "무난해요.",
  "추가 구매 고려 중이에요.",
  "친구에게도 추천했어요.",
];

function pickRating(): number {
  const total = RATING_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const { rating, weight } of RATING_WEIGHTS) {
    r -= weight;
    if (r <= 0) return rating;
  }
  return 5;
}

function randomDaysAgo(): Date {
  const days = DAYS_AGO_MIN + Math.random() * (DAYS_AGO_MAX - DAYS_AGO_MIN + 1);
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(days));
  return d;
}

function randomReviewContent(): string {
  return REVIEW_CONTENTS[Math.floor(Math.random() * REVIEW_CONTENTS.length)];
}

function generateUsers(count: number): UserInsert[] {
  const users: UserInsert[] = [];
  const base = `seed-${Date.now()}-`;
  for (let i = 0; i < count; i++) {
    users.push({
      email: `${base}user-${i}@example.com`,
      display_name: `시드사용자${i + 1}`,
      role: "user",
    });
  }
  return users;
}

async function ensureUsers(
  supabase: SupabaseClient<ExtendedDatabase>,
  minCount: number
): Promise<{ id: string }[]> {
  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .limit(minCount * 2);

  if (fetchError) {
    throw new Error(`사용자 조회 실패: ${fetchError.message}`);
  }

  const existingList = (existing ?? []) as { id: string }[];
  const need = minCount - existingList.length;

  if (need <= 0) {
    console.log(`✅ 기존 사용자 ${existingList.length}명으로 충분합니다.`);
    return existingList.slice(0, minCount);
  }

  console.log(`📝 사용자 ${need}명 추가 생성 중...`);
  const toInsert = generateUsers(need);
  let inserted = 0;

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { data: insertedRows, error } = await (
      supabase.from("users") as unknown as {
        insert: (data: UserInsert[]) => {
          select: (columns: string) => Promise<{
            data: { id: string }[] | null;
            error: { code?: string; message: string } | null;
          }>;
        };
      }
    )
      .insert(batch)
      .select("id");

    if (error) {
      if (error.code === "23505") {
        console.log(`⚠️  사용자 중복 무시: ${error.message}`);
        continue;
      }
      throw new Error(`사용자 삽입 실패: ${error.message}`);
    }
    if (insertedRows?.length) {
      existingList.push(...insertedRows);
      inserted += insertedRows.length;
    }
  }

  console.log(`✅ 사용자 ${inserted}명 추가 삽입 완료.`);
  return existingList;
}

async function getRegisteredProductIds(
  supabase: SupabaseClient<ExtendedDatabase>,
  limit: number
): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("status", "registered")
    .limit(limit);

  if (error) throw new Error(`상품 조회 실패: ${error.message}`);
  const rows = (data ?? []) as { id: string }[];
  return rows.map((r: { id: string }) => r.id);
}

async function getExistingReviewPairs(
  supabase: SupabaseClient<ExtendedDatabase>
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("reviews")
    .select("user_id, product_id");

  if (error) throw new Error(`리뷰 조회 실패: ${error.message}`);
  const set = new Set<string>();
  for (const row of (data ?? []) as { user_id: string; product_id: string }[]) {
    set.add(`${row.user_id}:${row.product_id}`);
  }
  return set;
}

export async function insertReviews(
  supabase: SupabaseClient<ExtendedDatabase>
): Promise<void> {
  const userIds = await ensureUsers(supabase, MIN_USERS);
  if (userIds.length === 0) {
    throw new Error("리뷰 작성에 사용할 사용자가 없습니다.");
  }

  const productIds = await getRegisteredProductIds(
    supabase,
    MAX_PRODUCTS_FOR_REVIEWS
  );
  if (productIds.length === 0) {
    console.log("⚠️  status=registered 상품이 없어 리뷰를 생성하지 않습니다.");
    return;
  }

  const existingPairs = await getExistingReviewPairs(supabase);
  const reviews: ReviewInsert[] = [];

  for (const productId of productIds) {
    const count =
      MIN_REVIEWS_PER_PRODUCT +
      Math.floor(
        Math.random() * (MAX_REVIEWS_PER_PRODUCT - MIN_REVIEWS_PER_PRODUCT + 1)
      );
    const shuffled = [...userIds].sort(() => Math.random() - 0.5);
    let added = 0;
    for (const u of shuffled) {
      if (added >= count) break;
      const key = `${u.id}:${productId}`;
      if (existingPairs.has(key)) continue;
      existingPairs.add(key);
      reviews.push({
        user_id: u.id,
        product_id: productId,
        rating: pickRating(),
        content: randomReviewContent(),
        created_at: randomDaysAgo().toISOString(),
      });
      added++;
    }
  }

  if (reviews.length === 0) {
    console.log("⚠️  추가할 리뷰가 없습니다 (모두 중복).");
    return;
  }

  let insertedCount = 0;
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const reviewsTable = supabase.from("reviews");
    const { error } = await (
      reviewsTable as unknown as {
        insert: (
          data: ReviewInsert[]
        ) => ReturnType<typeof reviewsTable.insert>;
      }
    ).insert(batch);
    if (error) {
      if (error.code === "23505") {
        console.log(`⚠️  리뷰 중복 무시: ${error.message}`);
        continue;
      }
      throw new Error(`리뷰 삽입 실패: ${error.message}`);
    }
    insertedCount += batch.length;
    console.log(`✅ 리뷰 ${insertedCount}/${reviews.length}개 삽입 완료`);
  }
  console.log(`🎉 총 ${insertedCount}개 리뷰 삽입 완료.`);
}

async function main() {
  try {
    console.log("🚀 사용자/리뷰 Seed 시작...\n");
    const env = getServerEnv();
    const { supabase } = env;
    const client = createClient<ExtendedDatabase>(
      supabase.url,
      supabase.secretKey,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        db: { schema: "public" },
      }
    );
    console.log(`📦 프로젝트: ${supabase.url}\n`);
    await insertReviews(client);
    console.log("\n🎉 Seed 작업이 완료되었습니다.");
  } catch (err) {
    console.error(
      "\n❌ Seed 실행 중 오류:",
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
