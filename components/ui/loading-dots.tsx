import React from "react";
import { cn } from "@/commons/utils/cn";

export interface LoadingDotsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: {
    dot: "w-1.5 h-1.5",
    gap: "gap-1",
  },
  md: {
    dot: "w-2 h-2",
    gap: "gap-1.5",
  },
  lg: {
    dot: "w-2.5 h-2.5",
    gap: "gap-2",
  },
};

export const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
  ({ className, size = "md" }, ref) => {
    const currentSize = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={cn(
          "flex justify-center items-center py-8",
          currentSize.gap,
          className
        )}
        role="status"
        aria-label="Loading"
        aria-live="polite"
      >
        <div
          className={cn("rounded-full", currentSize.dot)}
          style={{
            backgroundColor: "var(--commerce-primary-main)",
            animation: "loading-dots 1.4s ease-in-out infinite",
            animationDelay: "0ms",
          }}
        />
        <div
          className={cn("rounded-full", currentSize.dot)}
          style={{
            backgroundColor: "var(--commerce-primary-main)",
            animation: "loading-dots 1.4s ease-in-out infinite",
            animationDelay: "200ms",
          }}
        />
        <div
          className={cn("rounded-full", currentSize.dot)}
          style={{
            backgroundColor: "var(--commerce-primary-main)",
            animation: "loading-dots 1.4s ease-in-out infinite",
            animationDelay: "400ms",
          }}
        />
      </div>
    );
  }
);

LoadingDots.displayName = "LoadingDots";
