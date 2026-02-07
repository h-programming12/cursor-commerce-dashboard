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
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "54px",
            lineHeight: "58px",
            letterSpacing: "-1px",
            color: commerceColors.text.primary,
          }}
        >
          Cart
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
              lineHeight: commerceTypography.body["1"].lineHeight,
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
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "54px",
          lineHeight: "58px",
          letterSpacing: "-1px",
          color: commerceColors.text.primary,
        }}
      >
        Cart
      </h1>

      {/* Process stepper: 1 Shopping cart, 2 Checkout details, 3 Order complete */}
      <nav
        className="flex flex-wrap items-center gap-6 mb-10"
        aria-label="Checkout process"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              backgroundColor: commerceColors.neutral["05"]["100"],
              color: commerceColors.background.default,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
            }}
          >
            1
          </span>
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
              color: commerceColors.text.primary,
            }}
          >
            Shopping cart
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              backgroundColor: commerceColors.neutral["04"]["100"],
              color: commerceColors.background.default,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
            }}
          >
            2
          </span>
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
              color: commerceColors.neutral["04"]["100"],
            }}
          >
            Checkout details
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              backgroundColor: commerceColors.neutral["04"]["100"],
              color: commerceColors.background.default,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
            }}
          >
            3
          </span>
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
              color: commerceColors.neutral["04"]["100"],
            }}
          >
            Order complete
          </span>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <section className="flex-1 min-w-0" aria-label="Cart items">
          <div
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: commerceColors.neutral["04"]["100"] }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-[1fr_80px_1fr_1fr] gap-4 items-center h-[50px] px-4 border-b"
              style={{
                borderColor: commerceColors.neutral["04"]["100"],
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "16px",
                lineHeight: "26px",
                color: "#121212",
              }}
            >
              <span>Product</span>
              <span>Quantity</span>
              <span className="text-right">Price</span>
              <span className="text-right">Subtotal</span>
            </div>
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
        <aside className="lg:w-[413px] shrink-0">
          <div className="sticky top-24">
            <CartSummary subtotal={totalAmount} />
          </div>
        </aside>
      </div>
    </div>
  );
}
