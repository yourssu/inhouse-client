import { useSuspenseQuery } from '@tanstack/react-query';
import { Lottie } from '@toss/lottie';
import { useDelayedValue, useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { objectValues } from '@yourssu-inhouse/inhouse-utils/object';
import { Button, Checkbox } from '@yourssu-inhouse/interior';
import { Pagination } from '@yourssu-inhouse/interior';
import { Result } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { assert, invert } from 'es-toolkit';
import { startTransition } from 'react';

import type { ApplicantStateType } from '@/apis/applicants/schema';

import { applicantsOption } from '@/apis/applicants/query';
import { partsOption } from '@/apis/parts/query';
import { usePaginatedItems } from '@/hooks/usePaginatedItems';
import { useSearchState } from '@/hooks/useSearchState';
import { useApplicantSelectionContext } from '@/routes/~_auth/~recruit/~applicants/context';
import { partNameKo, type PartNameKoType } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

interface ApplicantsTableProps {
  searchKeyword: string;
  semesterId?: number;
  state: ApplicantStateType;
}

export const ApplicantsTable = ({ searchKeyword, semesterId, state }: ApplicantsTableProps) => {
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/applicants/' });
  const setters = {
    page: useSetStateSelector(setSearch, 'page'),
    partId: useSetStateSelector(setSearch, 'partId'),
  };

  const { data: parts } = useSuspenseQuery(partsOption());
  const part = parts.find(({ partId }) => partId === search.partId);

  const { data: applicants } = useSuspenseQuery(
    applicantsOption({
      state,
      partId: search.partId,
      semesterId,
      name: useDelayedValue(searchKeyword) || undefined,
    }),
  );
  const applicantIds = applicants.map(({ applicantId }) => applicantId);

  const {
    items: paginatedApplicants,
    page,
    totalPages,
  } = usePaginatedItems(applicants, {
    currentPage: search.page ?? 1,
    pageSize: 10,
  });

  const { isSelected, isAllSelected, toggle, toggleAll } = useApplicantSelectionContext();

  const onPartFilterChange = (v: PartNameKoType) => {
    const partNameEn = invert(partNameKo)[v];
    const part = parts.find(({ partName }) => partName === partNameEn);
    assert(!!part, '존재하지 않는 파트를 선택했어요.');
    startTransition(() => {
      setters.partId(part.partId);
      setters.page(undefined);
    });
  };

  return (
    <>
      <Table className="px-3 pb-4" rowCount={paginatedApplicants.length}>
        <Table.Head>
          <Table.Th className="w-fit min-w-fit flex-none pr-3">
            <Checkbox
              checked={isAllSelected(applicantIds)}
              onCheckedChange={(checked) => toggleAll(applicantIds, checked)}
            />
          </Table.Th>
          <Table.Th align="left">{`지원자 목록 · ${applicants.length}명`}</Table.Th>
          <Table.ThSelect
            items={objectValues(partNameKo)}
            onValueChange={onPartFilterChange}
            placeholder="지원 파트"
            value={part && partNameKo[part.partName]}
          />
          <Table.Th>학번</Table.Th>
          <Table.Th>학과</Table.Th>
          <Table.Th>현재 학기</Table.Th>
          <Table.Th infoContent="연도 기준 나이예요.">나이</Table.Th>
          <Table.Th>지원일</Table.Th>
          <Table.Th />
        </Table.Head>
        <Table.Body>
          {paginatedApplicants.map((applicant) => (
            <Table.Row key={applicant.applicantId}>
              <Table.Cell className="w-fit min-w-fit flex-none pr-3">
                <Checkbox
                  checked={isSelected(applicant.applicantId)}
                  onCheckedChange={(checked) => toggle(applicant.applicantId, checked)}
                />
              </Table.Cell>
              <Table.Cell align="left" className="text-neutral font-medium">
                <span className="shrink-0">{applicant.name}</span>
              </Table.Cell>
              <Table.Cell>{partNameKo[applicant.part]}</Table.Cell>
              <Table.Cell>{applicant.studentId}</Table.Cell>
              <Table.Cell>{applicant.department}</Table.Cell>
              <Table.Cell>{formatSemester(applicant.semester)}</Table.Cell>
              <Table.Cell>{applicant.age}세</Table.Cell>
              <Table.Cell>{formatTemplates['2026-01-01'](applicant.applicationDate)}</Table.Cell>
              <Table.Cell>
                <Button size="sm" variant="subPrimary">
                  서류 평가
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {paginatedApplicants.length === 0 && (
        <Result
          description="상태를 변경하거나 필터를 제거해보세요."
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
