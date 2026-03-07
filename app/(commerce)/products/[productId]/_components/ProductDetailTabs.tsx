"use client";

import React, { useState } from "react";
import { cn } from "@/commons/utils/cn";

export type ProductDetailTabId = "additional-info" | "reviews";

export interface ProductDetailTabsProps {
  defaultTab?: ProductDetailTabId;
  additionalInfoContent: React.ReactNode;
  reviewsContent: React.ReactNode;
  className?: string;
}

const TAB_CONFIG: { id: ProductDetailTabId; label: string }[] = [
  { id: "reviews", label: "Reviews" },
  { id: "additional-info", label: "Additional Info" },
];

export const ProductDetailTabs: React.FC<ProductDetailTabsProps> = ({
  defaultTab = "reviews",
  additionalInfoContent,
  reviewsContent,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<ProductDetailTabId>(defaultTab);

  const content =
    activeTab === "additional-info" ? additionalInfoContent : reviewsContent;

  return (
    <div className={cn("w-full", className)} role="tablist">
      {/* Figma Tabs/Menu: height 32px, border #e8ecef, Inter Medium 18px, letterSpacing -0.4px */}
      <div className="flex h-8 border-b border-(--commerce-neutral-03-100)">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "h-8 flex items-center px-0 text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-neutral-07-100) focus-visible:ring-offset-2 rounded-t",
              "mr-8 last:mr-0",
              activeTab === tab.id
                ? "text-(--commerce-text-primary) border-b-2 border-(--commerce-primary-main) -mb-px box-border"
                : "text-(--commerce-text-tertiary) border-b-2 border-transparent -mb-px box-border"
            )}
            style={{ letterSpacing: "-0.4px", lineHeight: "32px" }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {content}
      </div>
    </div>
  );
};
