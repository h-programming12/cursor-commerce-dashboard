import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  salePrice: number | null;
  totalPrice: number;
}

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      product_id,
      quantity,
      products (
        id,
        name,
        price,
        sale_price,
        image_url
      )
    `
    )
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const items: CartItemDto[] = (rows ?? []).map((row: Record<string, unknown>) => {
    const product = row.products as Record<string, unknown> | null;
    const productId = (row.product_id as string) ?? (product?.id as string);
    const price = Number(product?.price ?? 0);
    const salePrice = product?.sale_price != null ? Number(product.sale_price) : null;
    const unitPrice = salePrice ?? price;
    const quantity = Number(row.quantity ?? 1);
    return {
      id: row.id as string,
      productId,
      productName: (product?.name as string) ?? "",
      productImageUrl: (product?.image_url as string) ?? null,
      quantity,
      unitPrice,
      salePrice,
      totalPrice: unitPrice * quantity,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { productId: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const productId = body.productId;
  const quantity = Math.max(1, Number(body.quantity) || 1);
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: existingRow } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  type CartRow = { id: string; quantity: number } | null;
  const existing = existingRow as CartRow;
  const newQuantity = existing
    ? existing.quantity + quantity
    : quantity;

  type CartUpdate = Database["public"]["Tables"]["cart_items"]["Update"];
  type CartInsert = Database["public"]["Tables"]["cart_items"]["Insert"];
  let upsertError: { message: string; code?: string } | null = null;
  if (existing != null) {
    const payload: CartUpdate = {
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    };
    const res = await supabase.from("cart_items").update(payload as never).eq("user_id", userId).eq("product_id", productId);
    upsertError = res.error;
  } else {
    const payload: CartInsert = { user_id: userId, product_id: productId, quantity: newQuantity };
    const res = await supabase.from("cart_items").insert(payload as never);
    upsertError = res.error;
  }

  if (upsertError) {
    const code = "code" in upsertError ? upsertError.code : undefined;
    if (code === "23503") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: upsertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { productId: string; quantity: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const productId = body.productId;
  const quantity = Number(body.quantity);
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const supabase = await createClient();

  if (quantity <= 0) {
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  }

  const patchPayload: Database["public"]["Tables"]["cart_items"]["Update"] = {
    quantity,
    updated_at: new Date().toISOString(),
  };
  const { error: updateError } = await supabase
    .from("cart_items")
    .update(patchPayload as never)
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
