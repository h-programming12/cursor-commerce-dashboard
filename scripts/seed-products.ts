/**
 * 상품 데이터 Seed 스크립트
 *
 * 이 스크립트는 Supabase에 상품 샘플 데이터를 삽입합니다.
 *
 * 사용법:
 *   yarn db:seed
 *
 * 환경변수:
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
 *   - SUPABASE_SECRET_KEY: Supabase Service Role Key (필수)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { getServerEnv } from "../commons/config/env";
import type { Database } from "../types/supabase";

// .env.local 파일 로드
config({ path: ".env.local" });

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

/**
 * 상품 데이터 타입
 */
interface ProductData {
  name: string;
  description: string | null;
  price: number;
  sale_price?: number;
  image_url: string | null;
  status: "registered" | "hidden" | "sold_out";
  categories?: string[];
}

/**
 * 상품 샘플 데이터 생성
 */
function generateProductData(): ProductData[] {
  const products: ProductData[] = [];

  // 전자제품 (15개)
  const electronics = [
    {
      name: "무선 이어폰 프로",
      description: "프리미엄 노이즈 캔슬링 무선 이어폰, 30시간 배터리 수명",
      price: 199900,
      sale_price: 159900,
      image_url:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      status: "registered" as const,
      categories: ["전자제품", "이어폰"],
    },
    {
      name: "스마트워치 울트라",
      description: "심박수 모니터와 GPS가 있는 고급 피트니스 트래커",
      price: 349900,
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      status: "registered" as const,
      categories: ["전자제품", "스마트워치"],
    },
    {
      name: "블루투스 스피커",
      description: "360도 서라운드 사운드, 방수 기능, 20시간 재생",
      price: 129900,
      sale_price: 99900,
      image_url:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
      status: "registered" as const,
      categories: ["전자제품", "스피커"],
    },
    {
      name: "기계식 키보드",
      description: "체리 MX 스위치, RGB 백라이트, 풀 사이즈 레이아웃",
      price: 149900,
      image_url:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
      status: "registered" as const,
      categories: ["전자제품", "키보드"],
    },
    {
      name: "무선 마우스",
      description: "고정밀 센서, 에르고노믹 디자인, 2년 배터리 수명",
      price: 89900,
      image_url:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
      status: "registered" as const,
      categories: ["전자제품", "마우스"],
    },
    {
      name: "노이즈 캔슬링 헤드폰",
      description:
        "프리미엄 오버이어 헤드폰, 40시간 배터리, 액티브 노이즈 캔슬링",
      price: 299900,
      sale_price: 249900,
      image_url:
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
      status: "registered" as const,
      categories: ["전자제품", "헤드폰"],
    },
    {
      name: "태블릿 스탠드",
      description: "조정 가능한 각도, 알루미늄 소재, 다양한 태블릿 호환",
      price: 49900,
      image_url:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800",
      status: "registered" as const,
      categories: ["전자제품", "액세서리"],
    },
    {
      name: "USB-C 허브",
      description: "8-in-1 멀티 포트, 4K HDMI 출력, 고속 데이터 전송",
      price: 69900,
      image_url:
        "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800",
      status: "registered" as const,
      categories: ["전자제품", "액세서리"],
    },
    {
      name: "무선 충전기",
      description: "고속 무선 충전, 스마트폰 및 이어폰 동시 충전 가능",
      price: 39900,
      image_url:
        "https://images.unsplash.com/photo-1609091839311-d5365fcc4463?w=800",
      status: "registered" as const,
      categories: ["전자제품", "충전기"],
    },
    {
      name: "웹캠 HD",
      description: "1080p 해상도, 자동 조명 조정, 내장 마이크",
      price: 89900,
      image_url:
        "https://images.unsplash.com/photo-1587825147138-346d274efd04?w=800",
      status: "registered" as const,
      categories: ["전자제품", "웹캠"],
    },
    {
      name: "외장 하드 드라이브",
      description: "2TB 용량, USB 3.0, 휴대용 디자인",
      price: 119900,
      image_url:
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800",
      status: "registered" as const,
      categories: ["전자제품", "저장장치"],
    },
    {
      name: "스마트 홈 허브",
      description: "음성 제어, 다양한 IoT 기기 연동, 스마트 조명 제어",
      price: 179900,
      image_url:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      status: "registered" as const,
      categories: ["전자제품", "스마트홈"],
    },
    {
      name: "게이밍 마우스패드",
      description: "대형 사이즈, 정밀한 마우스 추적, 방수 코팅",
      price: 29900,
      image_url:
        "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800",
      status: "registered" as const,
      categories: ["전자제품", "게이밍"],
    },
    {
      name: "블루투스 이어폰",
      description: "경량 디자인, 8시간 재생, 빠른 충전",
      price: 59900,
      sale_price: 44900,
      image_url:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
      status: "sold_out" as const,
      categories: ["전자제품", "이어폰"],
    },
    {
      name: "스마트폰 케이스",
      description: "방수 보호, 충격 흡수, 투명 디자인",
      price: 24900,
      image_url:
        "https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=800",
      status: "registered" as const,
      categories: ["전자제품", "액세서리"],
    },
  ];

  // 의류 (10개)
  const clothing = [
    {
      name: "클래식 화이트 티셔츠",
      description: "100% 유기농 면, 편안한 핏, 다양한 사이즈",
      price: 29900,
      image_url:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      status: "registered" as const,
      categories: ["의류", "티셔츠"],
    },
    {
      name: "데님 재킷",
      description: "클래식 데님 재킷, 다양한 사이즈, 내구성 우수",
      price: 89900,
      sale_price: 69900,
      image_url:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
      status: "registered" as const,
      categories: ["의류", "재킷"],
    },
    {
      name: "캐주얼 스니커즈",
      description: "편안한 착화감, 가벼운 무게, 다양한 컬러",
      price: 79900,
      image_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      status: "registered" as const,
      categories: ["의류", "신발"],
    },
    {
      name: "야구 모자",
      description: "조절 가능한 스냅백, 다양한 컬러, 브랜드 로고",
      price: 34900,
      image_url:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
      status: "registered" as const,
      categories: ["의류", "모자"],
    },
    {
      name: "후드 집업",
      description: "부드러운 소재, 두꺼운 안감, 편안한 핏",
      price: 69900,
      image_url:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=800",
      status: "registered" as const,
      categories: ["의류", "후드"],
    },
    {
      name: "청바지",
      description: "슬림 핏, 스트레치 소재, 다양한 사이즈",
      price: 99900,
      sale_price: 79900,
      image_url:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
      status: "registered" as const,
      categories: ["의류", "바지"],
    },
    {
      name: "트레이닝 팬츠",
      description: "운동에 최적화된 소재, 편안한 착용감, 탄력 있는 핏",
      price: 49900,
      image_url:
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800",
      status: "registered" as const,
      categories: ["의류", "바지"],
    },
    {
      name: "니트 스웨터",
      description: "부드러운 울 소재, 따뜻한 보온성, 클래식 디자인",
      price: 89900,
      image_url:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
      status: "registered" as const,
      categories: ["의류", "스웨터"],
    },
    {
      name: "레더 재킷",
      description: "진짜 가죽 소재, 클래식 디자인, 내구성 우수",
      price: 249900,
      image_url:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
      status: "sold_out" as const,
      categories: ["의류", "재킷"],
    },
    {
      name: "베이직 반팔",
      description: "면 100%, 다양한 컬러, 기본 아이템",
      price: 19900,
      image_url:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      status: "hidden" as const,
      categories: ["의류", "티셔츠"],
    },
  ];

  // 가방/액세서리 (8개)
  const bagsAccessories = [
    {
      name: "가죽 백팩",
      description: "수제 진짜 가죽 백팩, 노트북 수납 공간 포함",
      price: 179900,
      sale_price: 149900,
      image_url:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      status: "registered" as const,
      categories: ["가방", "백팩"],
    },
    {
      name: "미니멀 지갑",
      description: "슬림 디자인, RFID 차단, 카드 수납 공간",
      price: 49900,
      image_url:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
      status: "registered" as const,
      categories: ["액세서리", "지갑"],
    },
    {
      name: "클래식 선글라스",
      description: "UV400 차단, 편안한 착용감, 스타일리시한 디자인",
      price: 89900,
      image_url:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
      status: "registered" as const,
      categories: ["액세서리", "선글라스"],
    },
    {
      name: "토트백",
      description: "대용량 수납, 내구성 우수, 다양한 컬러",
      price: 69900,
      image_url:
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
      status: "registered" as const,
      categories: ["가방", "토트백"],
    },
    {
      name: "크로스백",
      description: "가벼운 무게, 편안한 착용감, 실용적인 수납 공간",
      price: 79900,
      image_url:
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
      status: "registered" as const,
      categories: ["가방", "크로스백"],
    },
    {
      name: "시계",
      description: "클래식 아날로그 시계, 가죽 스트랩, 방수 기능",
      price: 149900,
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      status: "registered" as const,
      categories: ["액세서리", "시계"],
    },
    {
      name: "벨트",
      description: "진짜 가죽 벨트, 조절 가능, 클래식 버클",
      price: 59900,
      image_url:
        "https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=800",
      status: "registered" as const,
      categories: ["액세서리", "벨트"],
    },
    {
      name: "여행용 캐리어",
      description: "경량 소재, 360도 회전 바퀴, TSA 잠금장치",
      price: 199900,
      image_url:
        "https://images.unsplash.com/photo-1565026057447-bd90a53c4f1e?w=800",
      status: "hidden" as const,
      categories: ["가방", "캐리어"],
    },
  ];

  // 운동용품 (7개)
  const sports = [
    {
      name: "요가 매트 프로",
      description: "비 slip 표면, 두꺼운 쿠션, 휴대용 스트랩 포함",
      price: 49900,
      image_url:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
      status: "registered" as const,
      categories: ["운동용품", "요가"],
    },
    {
      name: "조정 가능한 덤벨 세트",
      description: "무게 조절 가능, 컴팩트 디자인, 홈 트레이닝에 최적",
      price: 149900,
      sale_price: 119900,
      image_url:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      status: "registered" as const,
      categories: ["운동용품", "웨이트"],
    },
    {
      name: "러닝화",
      description: "가벼운 무게, 쿠션 충격 흡수, 다양한 사이즈",
      price: 129900,
      image_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      status: "registered" as const,
      categories: ["운동용품", "신발"],
    },
    {
      name: "요가 블록",
      description: "고밀도 폼 소재, 다양한 컬러, 안정적인 지지",
      price: 19900,
      image_url:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
      status: "registered" as const,
      categories: ["운동용품", "요가"],
    },
    {
      name: "저항 밴드 세트",
      description: "다양한 저항 레벨, 휴대용, 전신 운동 가능",
      price: 29900,
      image_url:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      status: "registered" as const,
      categories: ["운동용품", "밴드"],
    },
    {
      name: "운동용 물병",
      description: "BPA 프리, 누수 방지, 750ml 용량",
      price: 24900,
      image_url:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
      status: "registered" as const,
      categories: ["운동용품", "액세서리"],
    },
    {
      name: "피트니스 트래커",
      description: "심박수 모니터, 걸음 수 추적, 수면 분석",
      price: 99900,
      image_url:
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
      status: "sold_out" as const,
      categories: ["운동용품", "트래커"],
    },
  ];

  products.push(...electronics, ...clothing, ...bagsAccessories, ...sports);

  return products;
}

/**
 * 상품 데이터를 Supabase에 삽입
 */
export async function insertProducts(
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // 기존 상품 개수 확인
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw new Error(`상품 개수 확인 실패: ${countError.message}`);
    }

    if (count !== null && count >= 40) {
      console.log(`✅ 이미 ${count}개의 상품이 존재합니다. 스킵합니다.`);
      return;
    }

    console.log(`📦 상품 데이터 삽입 시작... (현재 상품 수: ${count || 0})`);

    // 상품 데이터 생성
    const productData = generateProductData();
    console.log(`📝 ${productData.length}개의 상품 데이터 생성 완료`);

    // 배치로 삽입 (한 번에 최대 50개까지 가능)
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < productData.length; i += batchSize) {
      const batch = productData.slice(i, i + batchSize);
      const insertData = batch.map(
        (product): ProductInsert => ({
          name: product.name,
          description: product.description,
          price: product.price,
          sale_price: product.sale_price,
          image_url: product.image_url,
          status: product.status,
          categories: product.categories,
        })
      );

      // Supabase 타입 추론 이슈로 인한 타입 단언 필요
      // insert 메서드의 타입 추론이 제대로 작동하지 않는 경우가 있음
      const productsTable = supabase.from("products");
      const { error } = await (
        productsTable as unknown as {
          insert: (data: ProductInsert[]) => Promise<{
            error: { code?: string; message: string } | null;
          }>;
        }
      ).insert(insertData);

      if (error) {
        // 중복 키 에러(23505)는 무시
        if (error.code === "23505") {
          console.log(`⚠️  중복 키 에러 무시: ${error.message}`);
          continue;
        }
        throw new Error(`상품 삽입 실패: ${error.message}`);
      }

      insertedCount += batch.length;
      console.log(`✅ ${insertedCount}/${productData.length}개 상품 삽입 완료`);
    }

    console.log(`🎉 총 ${insertedCount}개의 상품이 성공적으로 삽입되었습니다!`);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`알 수 없는 오류: ${String(error)}`);
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log("🚀 상품 데이터 Seed 시작...\n");

    // 환경변수 검증
    const env = getServerEnv();
    const { supabase } = env;

    // Supabase 클라이언트 생성 (Service Role Key 사용)
    const client = createClient<Database>(supabase.url, supabase.secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: "public",
      },
    });

    console.log(`📦 프로젝트: ${supabase.url}`);
    console.log();

    // 상품 데이터 삽입
    await insertProducts(client);

    console.log("\n🎉 Seed 작업이 성공적으로 완료되었습니다!");
  } catch (error) {
    console.error("\n❌ Seed 실행 중 오류 발생:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// 스크립트로 직접 실행된 경우에만 main 실행
if (require.main === module) {
  main();
}
