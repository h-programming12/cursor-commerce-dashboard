import type { ReactNode } from "react";
import {
  AccountSidebar,
  type AccountSidebarProps,
} from "@/components/commerce/AccountSidebar";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

export interface AccountPageShellProps {
  title: string;
  activeItem: NonNullable<AccountSidebarProps["activeItem"]>;
  displayName?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  isAdmin?: boolean;
  children: ReactNode;
}

export function AccountPageShell({
  title,
  activeItem,
  displayName,
  email,
  imageUrl,
  isAdmin,
  children,
}: AccountPageShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 py-8 md:py-12 lg:py-20">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 md:px-8 lg:px-20">
          <h1
            className="mb-6 md:mb-12"
            style={{
              fontSize: "clamp(32px, 7vw, 54px)",
              lineHeight: "58px",
              fontFamily: commerceTypography.headline.h3.fontFamily,
              fontWeight: commerceTypography.headline.h3.fontWeight,
              letterSpacing: "-1px",
              color: commerceColors.text.primary,
            }}
          >
            {title}
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            <AccountSidebar
              displayName={displayName}
              email={email}
              imageUrl={imageUrl}
              activeItem={activeItem}
              isAdmin={isAdmin}
            />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
