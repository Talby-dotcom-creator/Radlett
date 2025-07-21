import { useState, useCallback, useMemo } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 20
}: UsePaginationProps = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const canGoNext = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const canGoPrev = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  const setPage = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(clampedPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [canGoNext]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      setCurrentPage(prev => prev - 1);
    }
  }, [canGoPrev]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    // Reset to first page when page size changes
    setCurrentPage(1);
  }, []);

  const handleSetTotalItems = useCallback((total: number) => {
    setTotalItems(total);
  }, []);

  const state: PaginationState = {
    currentPage,
    pageSize,
    totalItems,
    totalPages
  };

  const actions: PaginationActions = useMemo(() => ({
    setPage,
    setPageSize: handleSetPageSize,
    setTotalItems: handleSetTotalItems,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrev
  }), [setPage, handleSetPageSize, handleSetTotalItems, nextPage, prevPage, goToFirstPage, goToLastPage, canGoNext, canGoPrev]);

  return [state, actions];
};