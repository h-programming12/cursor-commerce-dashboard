"use client";

import Image from "next/image";
import Link from "next/link";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { formatPrice } from "@/commons/utils/formatPrice";
import { COMMERCE_URLS } from "@/commons/constants/url";
import type { WishlistItem } from "@/app/(commerce)/likes/wishlist-types";

const STATUS_LABEL: Record<WishlistItem["status"], string> = {
  registered: "판매중",
  hidden: "숨김",
  sold_out: "Sold Out",
};

export interface LikeListTableProps {
  items: WishlistItem[];
}

export function LikeListTable({ items }: LikeListTableProps) {
  const captionStyle = {
    fontSize: 14,
    lineHeight: "22px",
    fontFamily: commerceTypography.caption["1"].fontFamily,
    fontWeight: 400,
    color: commerceColors.text.tertiary,
  };
  const cellStyle = {
    fontSize: 14,
    lineHeight: "22px",
    fontFamily: commerceTypography.caption["1"].fontFamily,
    fontWeight: 400,
    color: commerceColors.neutral["07"]["100"],
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr
            className="border-b"
            style={{ borderColor: commerceColors.neutral["03"]["100"] }}
          >
            <th
              className="text-left py-3 pr-4"
              style={{ ...captionStyle, width: "160px" }}
            >
              Image
            </th>
            <th className="text-left py-3 pr-4" style={{ ...captionStyle }}>
              Name
            </th>
            <th className="text-left py-3 pr-4" style={{ ...captionStyle }}>
              Status
            </th>
            <th className="text-left py-3" style={captionStyle}>
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const displayPrice = item.salePrice ?? item.price;
            return (
              <tr
                key={item.likeItemId}
                className="border-b align-middle"
                style={{ borderColor: commerceColors.neutral["03"]["100"] }}
              >
                <td className="py-4 pr-4 align-middle">
                  <Link
                    href={COMMERCE_URLS.PRODUCT_DETAIL(item.productId)}
                    className="block w-20 h-24 relative rounded overflow-hidden bg-(--commerce-background-light) shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-primary-main)"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[10px]"
                        style={{ color: commerceColors.text.tertiary }}
                      >
                        No image
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-4 pr-4" style={cellStyle}>
                  <Link
                    href={COMMERCE_URLS.PRODUCT_DETAIL(item.productId)}
                    className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--commerce-primary-main)"
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="py-4 pr-4" style={cellStyle}>
                  {STATUS_LABEL[item.status]}
                </td>
                <td className="py-4" style={cellStyle}>
                  {formatPrice(displayPrice)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
