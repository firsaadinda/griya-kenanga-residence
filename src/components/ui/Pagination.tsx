"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemName = "data",
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate list of page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E8EAEC] text-xs">
      <div className="text-[#737A84]">
        Menampilkan{" "}
        <strong className="text-[#1C1E22] font-semibold">{startItem}</strong> -{" "}
        <strong className="text-[#1C1E22] font-semibold">{endItem}</strong> dari{" "}
        <strong className="text-[#1C1E22] font-semibold">{totalItems}</strong> {itemName}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#E8EAEC] bg-white text-[#26292E] font-medium hover:bg-[#F6F7F9] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#737A84]" />
          <span>Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="px-2 text-[#737A84]">
                  ...
                </span>
              );
            }
            const pageNum = Number(p);
            const isActive = pageNum === currentPage;
            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                  isActive
                    ? "bg-[#1C1E22] text-[#88BC3C] border border-[#5E8826]/40 shadow-xs"
                    : "text-[#26292E] hover:bg-[#F6F7F9] border border-transparent hover:border-[#E8EAEC]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#E8EAEC] bg-white text-[#26292E] font-medium hover:bg-[#F6F7F9] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#737A84]" />
        </button>
      </div>
    </div>
  );
}
