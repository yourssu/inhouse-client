import clsx from 'clsx';
import { startTransition } from 'react';
import { MdMoreHoriz } from 'react-icons/md';

import { NavButton } from './NavButton';
import { PageButton } from './PageButton';
import * as styles from './Pagination.css';

interface PaginationProps {
  className?: string;
  currentPage: number;
  disabled?: boolean;
  maxVisiblePages?: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

/**
 * 페이지네이션에 표시할 페이지 숫자 배열을 계산합니다.
 * null은 생략 부호(...)를 나타냅니다.
 */
const getPageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible: number,
): (null | number)[] => {
  // 전체 페이지가 maxVisible + 2 (첫/마지막 + ...) 이하면 모두 표시
  if (totalPages <= maxVisible + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (null | number)[] = [];
  const sideCount = Math.floor((maxVisible - 1) / 2); // 현재 페이지 양쪽에 표시할 개수

  // 시작/끝 근처가 아닌 경우: 현재 페이지 중심으로 표시
  let startPage = currentPage - sideCount;
  let endPage = currentPage + sideCount;

  // 시작 부분에 가까운 경우
  if (startPage <= 2) {
    startPage = 1;
    endPage = maxVisible;
  }
  // 끝 부분에 가까운 경우
  else if (endPage >= totalPages - 1) {
    endPage = totalPages;
    startPage = totalPages - maxVisible + 1;
  }

  // 첫 페이지 표시
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push(null); // 생략 부호
    }
  }

  // 중간 페이지들
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // 마지막 페이지 표시
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(null); // 생략 부호
    }
    pages.push(totalPages);
  }

  return pages;
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  disabled = false,
  className,
}: PaginationProps) => {
  const pages = getPageNumbers(currentPage, totalPages, maxVisiblePages);

  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    startTransition(() => {
      onPageChange(page);
    });
  };

  const canGoPrev = currentPage > 1 && !disabled;
  const canGoNext = currentPage < totalPages && !disabled;

  return (
    <nav aria-label="페이지네이션" className={clsx(styles.paginationContainer, className)}>
      {pages.map((page, index) => {
        if (page === null) {
          return (
            <span aria-hidden className={styles.ellipsis} key={`ellipsis-${index}`}>
              <MdMoreHoriz size={16} />
            </span>
          );
        }
        return (
          <PageButton
            disabled={disabled}
            isActive={page === currentPage}
            key={page}
            onClick={() => handlePageChange(page)}
            page={page}
          />
        );
      })}

      <NavButton
        direction="prev"
        disabled={!canGoPrev}
        onClick={() => handlePageChange(currentPage - 1)}
      />
      <NavButton
        direction="next"
        disabled={!canGoNext}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    </nav>
  );
};
