"use client";

import Link from "next/link";
import { useCartStore } from "@/commons/store/cart-store";
import { CartItemRow, CartSummary } from "@/components/commerce";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { COMMERCE_URLS } from "@/commons/constants/url";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateItemQuantity(productId, quantity);
  };

  const handleRemove = (productId: string) => {
    removeItem(productId);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
        <h1
          className="mb-8"
          style={{
            fontFamily: commerceTypography.headline.h5.fontFamily,
            fontSize: `${commerceTypography.headline.h5.fontSize}px`,
            lineHeight: commerceTypography.headline.h5.lineHeight,
            fontWeight: commerceTypography.headline.h5.fontWeight,
            color: commerceColors.text.primary,
          }}
        >
          Your Cart
        </h1>
        <div
          className="flex flex-col items-center justify-center py-16 text-center border rounded-lg"
          style={{
            borderColor: commerceColors.neutral["03"]["100"],
            minHeight: "320px",
          }}
        >
          <p
            className="mb-4"
            style={{
              fontSize: `${commerceTypography.body["1"].fontSize}px`,
              lineHeight: `${commerceTypography.body["1"].lineHeight}px`,
              fontFamily: commerceTypography.body["1"].fontFamily,
              fontWeight: commerceTypography.body["1"].fontWeight,
              color: commerceColors.text.secondary,
            }}
          >
            Your cart is empty.
          </p>
          <Link
            href={COMMERCE_URLS.PRODUCTS}
            className="inline-flex items-center justify-center transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141718]"
            style={{
              height: "52px",
              paddingLeft: "24px",
              paddingRight: "24px",
              borderRadius: "8px",
              backgroundColor: commerceColors.neutral["07"]["100"],
              color: commerceColors.text.inverse,
              fontFamily: commerceTypography.button.m.fontFamily,
              fontSize: `${commerceTypography.button.m.fontSize}px`,
              lineHeight: commerceTypography.button.m.lineHeight,
              fontWeight: commerceTypography.button.m.fontWeight,
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="mb-8"
        style={{
          fontFamily: commerceTypography.headline.h5.fontFamily,
          fontSize: `${commerceTypography.headline.h5.fontSize}px`,
          lineHeight: commerceTypography.headline.h5.lineHeight,
          fontWeight: commerceTypography.headline.h5.fontWeight,
          color: commerceColors.text.primary,
        }}
      >
        Your Cart
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <section className="flex-1 min-w-0" aria-label="Cart items">
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: commerceColors.neutral["03"]["100"] }}>
            {items.map((item) => {
              const unitPrice = item.salePrice ?? item.price;
              const totalPrice = unitPrice * item.quantity;
              return (
                <CartItemRow
                  key={item.id}
                  item={{
                    id: item.id,
                    productId: item.id,
                    productName: item.name,
                    productImageUrl: item.imageUrl,
                    quantity: item.quantity,
                    unitPrice,
                    totalPrice,
                  }}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        </section>
        <aside className="lg:w-[400px] shrink-0">
          <div className="sticky top-24">
            <CartSummary subtotal={totalAmount} />
          </div>
        </aside>
      </div>
    </div>
  );
}
