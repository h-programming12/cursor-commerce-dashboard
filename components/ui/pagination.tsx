import React from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";

const ChevronLeftIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 12L6 8L10 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 4L10 8L6 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxVisiblePages = 5,
}) => {
  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= halfVisible + 1) {
      for (let i = 1; i <= maxVisiblePages - 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - halfVisible) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - maxVisiblePages + 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (
        let i = currentPage - halfVisible + 1;
        i <= currentPage + halfVisible - 1;
        i++
      ) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const buttonBaseStyles =
    "flex items-center justify-center w-7 h-7 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#141718] disabled:opacity-50 disabled:cursor-not-allowed";

  const activeButtonStyles = {
    backgroundColor: commerceColors.neutral["07"]["100"],
    color: "#FFFFFF",
  };

  const inactiveButtonStyles = {
    backgroundColor: "#F1F2F6",
    color: "#8B909A",
  };

  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={buttonBaseStyles}
        style={inactiveButtonStyles}
        aria-label="Previous page"
      >
        <ChevronLeftIcon />
      </button>

      {visiblePages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-7 h-7 text-[#8B909A]"
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={buttonBaseStyles}
            style={isActive ? activeButtonStyles : inactiveButtonStyles}
            aria-label={`Page ${page}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span
              style={{
                fontSize: "13px",
                lineHeight: "20px",
                fontFamily: "Public Sans, sans-serif",
                fontWeight: 400,
              }}
            >
              {page}
            </span>
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={buttonBaseStyles}
        style={inactiveButtonStyles}
        aria-label="Next page"
      >
        <ChevronRightIcon />
      </button>
    </nav>
  );
};
