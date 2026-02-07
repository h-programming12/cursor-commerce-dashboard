"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { Pagination } from "@/components/ui/pagination";

export interface AccountPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  className?: string;
}

export function AccountPagination({
  currentPage,
  totalPages,
  basePath,
  className,
}: AccountPaginationProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    const path = page <= 1 ? basePath : `${basePath}?page=${page}`;
    router.push(path);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      aria-label="찜 목록 페이지 이동"
    >
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </nav>
  );
}
