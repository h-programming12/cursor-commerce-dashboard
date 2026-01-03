import { NextResponse } from "next/server";

export async function GET() {
  // 상품 목록 조회 API
  return NextResponse.json({ message: "상품 목록 API" });
}

export async function POST() {
  // 상품 생성 API
  return NextResponse.json({ message: "상품 생성 API" });
}
