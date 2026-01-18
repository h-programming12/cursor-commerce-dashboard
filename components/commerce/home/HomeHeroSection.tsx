"use client";

import Link from "next/link";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import Image from "next/image";

export interface HomeHeroSectionProps {
  className?: string;
}

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function HomeHeroSection({ className }: HomeHeroSectionProps) {
  return (
    <section
      className={cn("w-full bg-(--commerce-background-light)", className)}
      aria-label="Hero banner section"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* 왼쪽: 이미지 영역 */}
          <div className="relative h-[400px] w-full md:h-[532px]">
            <Image
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=720&h=532&fit=crop"
              alt="Hero banner"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 오른쪽: 콘텐츠 영역 */}
          <div className="flex flex-col justify-center bg-(--commerce-background-light) px-6 py-12 md:px-12 md:py-16">
            {/* 라벨 */}
            <p
              className="mb-4 text-(--commerce-semantic-info)"
              style={{
                fontFamily: "var(--commerce-font-inter)",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "24px",
              }}
            >
              SALE UP TO 35% OFF
            </p>

            {/* 메인 제목 */}
            <h2
              className="mb-6 text-(--commerce-neutral-07-100)"
              style={{
                fontFamily: "var(--commerce-font-poppins)",
                fontSize: "40px",
                fontWeight: 500,
                lineHeight: "44px",
                letterSpacing: "-0.4px",
              }}
            >
              HUNDREDS of
              <br />
              New lower prices!
            </h2>

            {/* 설명 텍스트 */}
            <p
              className="mb-8 text-(--commerce-neutral-07-100)"
              style={{
                fontFamily: "var(--commerce-font-inter)",
                fontSize: "20px",
                fontWeight: 400,
                lineHeight: "32px",
              }}
            >
              We&apos;ve reduced prices on hundreds of items, from everyday
              essentials to special treats. Shop now and save!
            </p>

            {/* Shop Now 버튼 */}
            <Link
              href={COMMERCE_URLS.PRODUCTS}
              className="group inline-flex w-fit items-center gap-2 rounded-lg border-2 border-(--commerce-neutral-07-100) bg-transparent px-8 py-3 text-(--commerce-neutral-07-100) transition-all hover:bg-(--commerce-neutral-07-100) hover:text-(--commerce-neutral-01-100) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2"
              style={{
                fontFamily: "var(--commerce-font-inter)",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              Shop Now
              <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
