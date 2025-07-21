import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onFirstPage: () => void;
  onLastPage: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  canGoNext,
  canGoPrev,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPrevPage,
  className = ''
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items info */}
      <div className="text-sm text-neutral-600">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-sm border border-neutral-300 rounded px-2 py-1 focus:border-secondary-500 focus:ring-secondary-500"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>

        <span className="text-sm text-neutral-600 mx-2">per page</span>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onFirstPage}
            disabled={!canGoPrev}
            className="p-2"
            title="First page"
          >
            <ChevronsLeft size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={!canGoPrev}
            className="p-2"
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-neutral-500">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className="min-w-[32px] h-8"
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!canGoNext}
            className="p-2"
            title="Next page"
          >
            <ChevronRight size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onLastPage}
            disabled={!canGoNext}
            className="p-2"
            title="Last page"
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;