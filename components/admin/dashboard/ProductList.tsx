import React from "react";
import Image from "next/image";

export interface DashboardProductItem {
  product_id: string;
  product_name: string;
  image_url: string | null;
  count: number;
  countLabel: string;
}

interface ProductListProps {
  title: string;
  products: DashboardProductItem[];
  emptyMessage: string;
}

export function ProductList({
  title,
  products,
  emptyMessage,
}: ProductListProps) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{
        backgroundColor: "var(--admin-background-default)",
        borderColor: "var(--admin-border-card)",
      }}
    >
      <h3
        className="mb-4"
        style={{
          fontSize: "var(--admin-headline-h7-font-size)",
          lineHeight: 1.2,
          fontFamily: "var(--admin-font-poppins)",
          fontWeight: "var(--admin-font-medium)",
          color: "var(--admin-text-primary)",
        }}
      >
        {title}
      </h3>
      {products.length === 0 ? (
        <p
          style={{
            fontSize: "var(--admin-text-md)",
            lineHeight: 1.5,
            fontFamily: "var(--admin-font-public-sans)",
            color: "var(--admin-text-tertiary)",
          }}
        >
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((item) => (
            <li key={item.product_id} className="flex items-center gap-3">
              <div
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded"
                style={{ backgroundColor: "var(--admin-background-light)" }}
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate"
                  style={{
                    fontSize: "var(--admin-text-md)",
                    lineHeight: 1.5,
                    fontFamily: "var(--admin-font-public-sans)",
                    color: "var(--admin-text-primary)",
                  }}
                >
                  {item.product_name}
                </p>
                <p
                  style={{
                    fontSize: "var(--admin-text-sm)",
                    lineHeight: 1.5,
                    fontFamily: "var(--admin-font-public-sans)",
                    color: "var(--admin-text-tertiary)",
                  }}
                >
                  {item.countLabel} {item.count}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
