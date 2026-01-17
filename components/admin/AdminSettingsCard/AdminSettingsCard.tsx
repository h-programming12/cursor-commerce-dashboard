"use client";

import React from "react";
import { cn } from "@/commons/utils/cn";
import type { AdminSettingsCardProps } from "../types";

export const AdminSettingsCard: React.FC<AdminSettingsCardProps> = ({
  title,
  description,
  icon,
  iconBgColor = "var(--admin-background-icon)",
  children,
  className,
}) => {
  return (
    <div
      className={cn("rounded-xl", className)}
      style={{
        backgroundColor: "var(--admin-background-default)",
        border: "1px solid var(--admin-border-card)",
        borderRadius: "var(--admin-radius-xl)",
        padding: "var(--admin-padding-xl)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          {icon && (
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: iconBgColor,
                borderRadius: "var(--admin-radius-lg)",
              }}
            >
              <div
                style={{
                  color: "var(--admin-status-icon)",
                  fontSize: "18px",
                }}
              >
                {icon}
              </div>
            </div>
          )}
          <div>
            <h3
              style={{
                fontSize: "var(--admin-text-xl)",
                lineHeight: "24px",
                fontFamily: "var(--admin-font-poppins)",
                fontWeight: "var(--admin-font-semibold)",
                color: "var(--admin-text-heading)",
                marginBottom: description ? "4px" : "0",
              }}
            >
              {title}
            </h3>
            {description && (
              <p
                style={{
                  fontSize: "var(--admin-text-md)",
                  lineHeight: "20px",
                  fontFamily: "var(--admin-font-poppins)",
                  fontWeight: "var(--admin-font-medium)",
                  color: "var(--admin-text-help)",
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
};
