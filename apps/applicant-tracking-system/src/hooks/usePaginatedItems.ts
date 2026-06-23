import { useState } from 'react';

type Options = {
  currentPage?: number;
  defaultPage?: number;
  pageSize: number;
};

export const usePaginatedItems = <T>(items: Array<T>, options: Options) => {
  const { defaultPage = 1, currentPage, pageSize } = options;
  const [innerCurrentPage, setInnerCurrentPage] = useState(defaultPage);

  const page = currentPage ?? innerCurrentPage;

  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

  const setPage = (nextPage: number) => {
    setInnerCurrentPage(nextPage);
  };

  return { items: paginatedItems, page, setPage, totalPages };
};
