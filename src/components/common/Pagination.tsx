"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomDropdown from "@/components/common/CustomDropdown";

interface PaginationProps {
  currentPage: number;
  totalEntries: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalEntries,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  // Generate page numbers with smart ellipsis
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
    <div className="px-5 py-4 bg-white border-t border-plum-100/80 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left: Showing entries text & page size selector */}
      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
        <span>
          Showing <strong className="font-bold text-plum-950">{startEntry}</strong> to{" "}
          <strong className="font-bold text-plum-950">{endEntry}</strong> of{" "}
          <strong className="font-bold text-plum-950">{totalEntries}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-plum-100">
            <span className="text-[11px] text-gray-400">Rows per page:</span>
            <CustomDropdown
              value={String(pageSize)}
              onChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}
              options={pageSizeOptions.map((opt) => ({
                value: String(opt),
                label: String(opt),
              }))}
              className="w-20"
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded-xl border border-plum-200 text-xs font-bold text-plum-800 hover:bg-plum-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Pills */}
        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-gray-400">
                ...
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center ${
                isActive
                  ? "bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 text-white shadow-md shadow-plum-900/20 border border-gold-400/40 scale-105"
                  : "text-gray-700 hover:bg-plum-50 hover:text-plum-950 border border-transparent"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2.5 py-1.5 rounded-xl border border-plum-200 text-xs font-bold text-plum-800 hover:bg-plum-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all flex items-center gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
