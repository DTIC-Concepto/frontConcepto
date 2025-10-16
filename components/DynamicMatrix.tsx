'use client'

import React from 'react';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMatrixNavigation } from '@/hooks/useMatrixNavigation';

interface MatrixProps {
  title: string;
  description: string;
  verticalHeaders: Array<{ code: string; description: string }>;
  horizontalHeaders: Array<{ code: string; description: string }>;
  relationships: Array<{ vertical: string; horizontal: string }>;
  onInfoClick: (type: 'vertical' | 'horizontal', code: string) => void;
  onCellClick?: (verticalCode: string, horizontalCode: string) => void;
  verticalLabel: string;
  horizontalLabel: string;
}

export default function DynamicMatrix({
  title,
  description,
  verticalHeaders,
  horizontalHeaders,
  relationships,
  onInfoClick,
  onCellClick,
  verticalLabel,
  horizontalLabel
}: MatrixProps) {
  const {
    canNavigateLeft,
    canNavigateRight,
    navigateLeft,
    navigateRight,
    getVisibleColumns,
    currentStartIndex
  } = useMatrixNavigation({ 
    totalColumns: horizontalHeaders.length,
    visibleColumns: 8 
  });

  const visibleHorizontalHeaders = getVisibleColumns(horizontalHeaders);

  const hasRelationship = (verticalCode: string, horizontalCode: string) => {
    return relationships.some(rel => 
      rel.vertical === verticalCode && rel.horizontal === horizontalCode
    );
  };

  const handleCellClick = (verticalCode: string, horizontalCode: string) => {
    onCellClick?.(verticalCode, horizontalCode);
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#171A1F] font-montserrat">
            {title}
          </h1>
          <p className="text-sm text-[#565D6D] font-open-sans">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#2D61A4] rounded" />
            <span className="text-[#171A1F] font-open-sans">{verticalLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <span className="text-[#171A1F] font-open-sans">{horizontalLabel}</span>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {horizontalHeaders.length > 8 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#565D6D] font-open-sans">
              Mostrando columnas {currentStartIndex + 1} - {Math.min(currentStartIndex + 8, horizontalHeaders.length)} de {horizontalHeaders.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={navigateLeft}
              disabled={!canNavigateLeft}
              className={`p-2 rounded-md border transition-colors ${
                canNavigateLeft 
                  ? 'border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white' 
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={navigateRight}
              disabled={!canNavigateRight}
              className={`p-2 rounded-md border transition-colors ${
                canNavigateRight 
                  ? 'border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white' 
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Matrix Section */}
      <div className="bg-gray-100 rounded-lg p-2 overflow-hidden">
        <div className="relative">
          <table className="w-full border-separate" style={{ borderSpacing: '2px' }}>
            <thead>
              <tr>
                {/* Static corner cell */}
                <th className="w-32 px-0 py-0 sticky left-0 z-20">
                  <div className="bg-[#E5E7EB] rounded px-4 py-3 h-[45px] flex items-center"></div>
                </th>
                {/* Horizontal headers */}
                {visibleHorizontalHeaders.map((header) => (
                  <th key={header.code} className="px-0 py-0">
                    <div className="bg-[#E5E7EB] rounded px-4 py-3 h-[45px] flex items-center justify-center gap-1">
                      <span className="text-sm font-medium text-[#171A1F] font-open-sans">
                        {header.code}
                      </span>
                      <button
                        onClick={() => onInfoClick('horizontal', header.code)}
                        className="hover:bg-gray-300 rounded p-1 transition-colors"
                      >
                        <Info className="w-4 h-4 text-[#565D6D]" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {verticalHeaders.map((verticalHeader) => (
                <tr key={verticalHeader.code}>
                  {/* Static vertical header */}
                  <td className="px-0 py-0 sticky left-0 z-10">
                    <div className="w-full bg-[#2D61A4] text-white rounded px-4 py-3 h-[45px] flex items-center justify-between">
                      <span className="text-sm font-medium font-open-sans">
                        {verticalHeader.code}
                      </span>
                      <button
                        onClick={() => onInfoClick('vertical', verticalHeader.code)}
                        className="hover:bg-blue-700 rounded p-1 transition-colors"
                      >
                        <Info className="w-4 h-4 text-white ml-1 flex-shrink-0" />
                      </button>
                    </div>
                  </td>
                  {/* Matrix cells */}
                  {visibleHorizontalHeaders.map((horizontalHeader) => (
                    <td key={`${verticalHeader.code}-${horizontalHeader.code}`} className="px-0 py-0">
                      <div 
                        className="bg-white rounded h-[45px] flex items-center justify-center relative cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleCellClick(verticalHeader.code, horizontalHeader.code)}
                      >
                        {hasRelationship(verticalHeader.code, horizontalHeader.code) ? (
                          <div className="absolute inset-0 bg-emerald-500/50 hover:bg-emerald-500/70 rounded flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M12.8864 3.51118C13.148 3.24953 13.5721 3.24953 13.8337 3.51118C14.0955 3.77283 14.0955 4.19695 13.8337 4.4586L6.46377 11.8286C6.20212 12.0902 5.778 12.0902 5.51635 11.8286L2.16635 8.47859L2.12055 8.42754C1.90591 8.16443 1.92105 7.7765 2.16635 7.53121C2.41164 7.28586 2.79958 7.27072 3.06273 7.48538L3.11377 7.53121L5.99006 10.4075L12.8864 3.51118Z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="absolute inset-0 rounded"></div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}