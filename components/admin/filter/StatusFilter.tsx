"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface StatusFilterOption<T extends string> {
  label: string;
  value: T | "all";
}

export interface StatusFilterProps<T extends string> {
  options: StatusFilterOption<T>[];
  value: T | "all";
  paramName?: string;
  baseUrl?: string;
}

export function StatusFilter<T extends string>({
  options,
  value,
  paramName = "status",
  baseUrl,
}: StatusFilterProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(next: T | "all") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (next === "all") {
      params.delete(paramName);
    } else {
      params.set(paramName, next);
    }
    const query = params.toString();
    const target = baseUrl ?? pathname;
    router.push(query ? `${target}?${query}` : target);
  }

  return (
    <div className="flex gap-2" role="group" aria-label={`${paramName} 필터`}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => handleChange(opt.value)}
          className="px-3 py-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor:
              value === opt.value
                ? "var(--admin-primary-main)"
                : "var(--admin-background-light)",
            color:
              value === opt.value
                ? "var(--admin-text-inverse)"
                : "var(--admin-text-primary)",
            fontFamily: "var(--admin-font-public-sans)",
            fontSize: "var(--admin-text-sm)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
