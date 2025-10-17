"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) {
  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 text-sm text-[#171A1F] hover:text-[#003366] transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>
      
      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-[32px] h-8 text-sm transition-colors rounded flex items-center justify-center ${
              currentPage === pageNum
                ? 'text-[#171A1F] font-bold'
                : 'text-[#171A1F] hover:text-[#003366] hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
      
      {/* Next Button */}
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 text-sm text-[#171A1F] hover:text-[#003366] transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}