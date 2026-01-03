import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  // 상품 상세 조회 API
  const { productId } = await params;
  return NextResponse.json({
    message: "상품 상세 API",
    productId,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  // 상품 수정 API
  const { productId } = await params;
  return NextResponse.json({
    message: "상품 수정 API",
    productId,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  // 상품 삭제 API
  const { productId } = await params;
  return NextResponse.json({
    message: "상품 삭제 API",
    productId,
  });
}
