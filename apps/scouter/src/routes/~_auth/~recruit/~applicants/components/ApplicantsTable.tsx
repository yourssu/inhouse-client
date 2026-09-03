import { useSuspenseQuery } from '@tanstack/react-query';
import { Lottie } from '@toss/lottie';
import { useDelayedValue, useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
import { objectValues } from '@yourssu-inhouse/inhouse-utils/object';
import { Badge, Pagination, Result, Table } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { assert, invert } from 'es-toolkit';
import { startTransition } from 'react';

import { applicantsOption } from '@/apis/applicants/query';
import { partsOption } from '@/apis/parts/query';
import { usePaginatedItems } from '@/hooks/usePaginatedItems';
import { useSearchState } from '@/hooks/useSearchState';
import { useApplicantsAnalytics } from '@/routes/~_auth/~recruit/~applicants/analytics';
import { ApplicantActionMenu } from '@/routes/~_auth/~recruit/~applicants/components/ApplicantActionMenu';
import {
  applicantStatesByTab,
  type ApplicantTabNameType,
} from '@/routes/~_auth/~recruit/~applicants/type';
import { applicantStateKo } from '@/types/applicants';
import { partNameKo, type PartNameKoType } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

interface ApplicantsTableProps {
  searchKeyword: string;
  selectedSemester?: string;
  semesterId?: number;
  tab: ApplicantTabNameType;
}

export const ApplicantsTable = ({
  searchKeyword,
  selectedSemester,
  semesterId,
  tab,
}: ApplicantsTableProps) => {
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/applicants/' });
  const trackApplicantsEvent = useApplicantsAnalytics();
  const setters = {
    page: useSetStateSelector(setSearch, 'page'),
    partId: useSetStateSelector(setSearch, 'partId'),
  };

  const { data: parts } = useSuspenseQuery(partsOption());
  const part = parts.find(({ partId }) => partId === search.partId);

  const { data: applicants } = useSuspenseQuery(
    applicantsOption({
      states: applicantStatesByTab[tab],
      partId: search.partId,
      semesterId,
      name: useDelayedValue(searchKeyword) || undefined,
    }),
  );

  const {
    items: paginatedApplicants,
    page,
    totalPages,
  } = usePaginatedItems(applicants, {
    currentPage: search.page ?? 1,
    pageSize: 10,
  });

  const onPartFilterChange = (v: PartNameKoType) => {
    const partNameEn = invert(partNameKo)[v];
    const part = parts.find(({ partName }) => partName === partNameEn);
    assert(!!part, '존재하지 않는 파트를 선택했어요.');

    if (part.partId !== search.partId) {
      trackApplicantsEvent('applicant_filter_changed', {
        current_tab: tab,
        has_search_query: searchKeyword.length > 0,
        selected_part: part.partName,
        selected_part_id: part.partId,
        ...(selectedSemester === undefined ? {} : { selected_semester: selectedSemester }),
      });
    }

    startTransition(() => {
      setters.partId(part.partId);
      setters.page(undefined);
    });
  };

  return (
    <>
      <Table className="px-3 pb-4" rowCount={paginatedApplicants.length}>
        <Table.Head>
          <Table.Th align="left">{`지원자 목록 · ${applicants.length}명`}</Table.Th>
          <Table.ThSelect
            items={objectValues(partNameKo)}
            onValueChange={onPartFilterChange}
            placeholder="지원 파트"
            value={part && partNameKo[part.partName]}
          />
          <Table.Th>학번</Table.Th>
          <Table.Th className="min-w-50">학과</Table.Th>
          <Table.Th>현재 학기</Table.Th>
          <Table.Th>출생년도</Table.Th>
          <Table.Th>심사 상태</Table.Th>
          <Table.Th className="w-12 min-w-12 flex-none">
            <span className="sr-only">지원자 액션</span>
          </Table.Th>
        </Table.Head>
        <Table.Body>
          {paginatedApplicants.map((applicant) => {
            const hasAssignment = parts.some(
              (part) => part.partId === applicant.partId && part.hasAssignment,
            );

            return (
              <Table.Row key={applicant.applicantId}>
                <Table.Cell align="left" className="text-neutral font-medium">
                  <span className="shrink-0">{applicant.name}</span>
                </Table.Cell>
                <Table.Cell>{partNameKo[applicant.part]}</Table.Cell>
                <Table.Cell>{applicant.studentId}</Table.Cell>
                <Table.Cell className="min-w-50">{applicant.department}</Table.Cell>
                <Table.Cell>{formatSemester(applicant.academicSemester)}</Table.Cell>
                <Table.Cell>{applicant.age}</Table.Cell>
                <Table.Cell>
                  <Badge color="violet" size="sm">
                    {applicantStateKo[applicant.state]}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="w-12 min-w-12 flex-none">
                  <ApplicantActionMenu applicant={applicant} hasAssignment={hasAssignment} />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      {paginatedApplicants.length === 0 && (
        <Result
          description="검색어를 변경하거나 필터를 제거해보세요."
          figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
          title="검색된 지원자가 없어요"
        />
      )}
      <div className="mt-5 flex w-full justify-end">
        <Pagination
          currentPage={page}
          onPageChange={(page) => setters.page(page)}
          totalPages={totalPages}
        />
      </div>
    </>
  );
};
