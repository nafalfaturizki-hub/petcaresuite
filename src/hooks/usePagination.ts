import { useCallback, useEffect, useState } from 'react';

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  resetOnFilterChange?: boolean;
  filterDependencies?: any[];
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  resetOnFilterChange = true,
  filterDependencies = []
}: PaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const onPageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const onPageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  useEffect(() => {
    if (resetOnFilterChange) {
      setPage(1);
    }
  }, [resetOnFilterChange, ...filterDependencies]);

  return {
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    setPage,
    setPageSize
  };
}
