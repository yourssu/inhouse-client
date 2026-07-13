import { Pagination } from '@yourssu-inhouse/interior';
import { useState } from 'react';

const Interactive = ({
  totalPages,
  maxVisiblePages = 5,
  initialPage = 1,
  title,
}: {
  initialPage?: number;
  maxVisiblePages?: number;
  title: string;
  totalPages: number;
}) => {
  const [page, setPage] = useState(initialPage);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-13 text-greyOpacity500">{title}</span>
      <Pagination
        currentPage={page}
        maxVisiblePages={maxVisiblePages}
        onPageChange={setPage}
        totalPages={totalPages}
      />
      <span className="text-13 text-greyOpacity500">현재 페이지: {page}</span>
    </div>
  );
};

export const PaginationView = () => {
  const [page, setPage] = useState(5);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">
          기본 (totalPages=10, maxVisiblePages=5, 현재 5)
        </h3>
        <Pagination currentPage={page} maxVisiblePages={5} onPageChange={setPage} totalPages={10} />
        <span className="text-13 text-greyOpacity500">현재 페이지: {page}</span>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">첫 페이지</h3>
        <Interactive initialPage={1} title="currentPage=1" totalPages={10} />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">마지막 페이지</h3>
        <Interactive initialPage={10} title="currentPage=10" totalPages={10} />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">페이지가 적을 때 (줄임 없음)</h3>
        <Interactive initialPage={2} title="totalPages=3" totalPages={3} />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">maxVisiblePages 조정</h3>
        <Interactive
          initialPage={6}
          maxVisiblePages={3}
          title="maxVisiblePages=3, totalPages=10"
          totalPages={10}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">disabled</h3>
        <Pagination
          currentPage={3}
          disabled
          maxVisiblePages={5}
          onPageChange={() => {}}
          totalPages={10}
        />
      </div>
    </div>
  );
};
