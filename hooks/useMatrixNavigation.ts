import { useState, useCallback } from 'react';

interface UseMatrixNavigationProps {
  totalColumns: number;
  visibleColumns?: number;
}

export const useMatrixNavigation = ({ 
  totalColumns, 
  visibleColumns = 8 
}: UseMatrixNavigationProps) => {
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  
  const canNavigateLeft = currentStartIndex > 0;
  const canNavigateRight = currentStartIndex + visibleColumns < totalColumns;
  
  const navigateLeft = useCallback(() => {
    if (canNavigateLeft) {
      setCurrentStartIndex(prev => Math.max(0, prev - 1));
    }
  }, [canNavigateLeft]);
  
  const navigateRight = useCallback(() => {
    if (canNavigateRight) {
      setCurrentStartIndex(prev => Math.min(totalColumns - visibleColumns, prev + 1));
    }
  }, [canNavigateRight, totalColumns, visibleColumns]);
  
  const getVisibleColumns = useCallback((columns: any[]) => {
    return columns.slice(currentStartIndex, currentStartIndex + visibleColumns);
  }, [currentStartIndex, visibleColumns]);
  
  const getColumnIndex = useCallback((originalIndex: number) => {
    return originalIndex - currentStartIndex;
  }, [currentStartIndex]);
  
  return {
    currentStartIndex,
    canNavigateLeft,
    canNavigateRight,
    navigateLeft,
    navigateRight,
    getVisibleColumns,
    getColumnIndex
  };
};