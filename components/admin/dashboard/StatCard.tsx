import React from "react";

interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{
        backgroundColor: "var(--admin-background-default)",
        borderColor: "var(--admin-border-card)",
      }}
    >
      <p
        style={{
          fontSize: "var(--admin-headline-h7-font-size)",
          lineHeight: 1.2,
          fontFamily: "var(--admin-font-poppins)",
          fontWeight: "var(--admin-font-medium)",
          color: "var(--admin-text-primary)",
        }}
      >
        {value}
      </p>
      <p
        className="mt-1"
        style={{
          fontSize: "var(--admin-text-sm)",
          lineHeight: 1.5,
          fontFamily: "var(--admin-font-public-sans)",
          color: "var(--admin-text-tertiary)",
        }}
      >
        {label}
      </p>
    </div>
  );
}
