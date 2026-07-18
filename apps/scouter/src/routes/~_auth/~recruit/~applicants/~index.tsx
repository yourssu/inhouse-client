import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
import { objectKeys } from '@yourssu-inhouse/inhouse-utils/object';
import { ChipTab } from '@yourssu-inhouse/interior';
import { InlineButton } from '@yourssu-inhouse/interior';
import { SearchField } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
import { invert } from 'es-toolkit';
import { Suspense, useState } from 'react';
import { z } from 'zod/v4';

import { semestersOption } from '@/apis/semesters/query';
import { Paper } from '@/components/Paper';
import { SemesterSelect } from '@/components/SemesterSelect';
import { useMultiSelectActions } from '@/hooks/useMultiSelectActions';
import { useSearchState } from '@/hooks/useSearchState';
import { ApplicantSelectionBar } from '@/routes/~_auth/~recruit/~applicants/components/ApplicantSelectionBar';
import { ApplicantsTable } from '@/routes/~_auth/~recruit/~applicants/components/ApplicantsTable';
import { ApplicantSelectionContext } from '@/routes/~_auth/~recruit/~applicants/context';
import { applicantTabNameKo } from '@/routes/~_auth/~recruit/~applicants/type';

const RouteComponent = () => {
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/applicants/' });
  const [keyword, setKeyword] = useState<string>(search.search ?? '');
  const setters = {
    t: useSetStateSelector(setSearch, 't'),
    page: useSetStateSelector(setSearch, 'page'),
    partId: useSetStateSelector(setSearch, 'partId'),
    search: useSetStateSelector(setSearch, 'search'),
    semesterId: useSetStateSelector(setSearch, 'semesterId'),
  };

  const { data: semesters } = useSuspenseQuery(semestersOption());
  const selectedSemester = semesters.find(({ semesterId }) => semesterId === search.semesterId);

  const applicantMultiSelectActions = useMultiSelectActions<number>();

  return (
    <ApplicantSelectionContext.Provider value={applicantMultiSelectActions}>
      <PageLayout.Content title="지원자">
        <ChipTab
          onTabChange={(t) => {
            setters.page(undefined);
            setters.t(applicantTabNameEn[t]);
          }}
          tab={applicantTabNameKo[search.t]}
          tabs={applicantTabNames.map((v) => applicantTabNameKo[v])}
        >
          {({ tab }) => (
            <div className="flex flex-[1_1_0] gap-4 pt-3.5">
              <Paper className="block h-fit min-w-180 grow px-3 pt-1 pb-3">
                <div className="mb-2 pt-3">
                  <div className="flex items-center gap-4 px-1">
                    <SearchField
                      className="w-60"
                      onChange={(v) => {
                        setters.search(v);
                        setKeyword(v);
                      }}
                      placeholder="이름으로 검색"
                      size="md"
                      value={keyword}
                      variant="outline"
                    />
                    <SemesterSelect
                      onValueChange={(v) => {
                        setters.semesterId(v.semesterId);
                        setters.page(undefined);
                      }}
                      size="md"
                      value={selectedSemester?.semester}
                      variant="outline"
                    />
                    {(search.partId || search.semesterId) && (
                      <InlineButton
                        className="text-violet600 text-sm font-medium underline"
                        onClick={() => {
                          setters.partId(undefined);
                          setters.semesterId(undefined);
                        }}
                      >
                        필터 제거하기
                      </InlineButton>
                    )}
                  </div>
                </div>
                <Suspense fallback={<Table.Skeleton count={10} />}>
                  <ApplicantsTable
                    searchKeyword={keyword}
                    semesterId={search.semesterId}
                    state={applicantTabNameEn[tab]}
                  />
                </Suspense>
              </Paper>
            </div>
          )}
        </ChipTab>
        {applicantMultiSelectActions.selectedIds.size > 0 && <ApplicantSelectionBar />}
      </PageLayout.Content>
    </ApplicantSelectionContext.Provider>
  );
};

const applicantTabNames = objectKeys(applicantTabNameKo);

const applicantTabNameEn = invert(applicantTabNameKo);

export const Route = createFileRoute('/_auth/recruit/applicants/')({
  component: RouteComponent,
  validateSearch: z.object({
    t: z.enum(applicantTabNames).default('UNDER_REVIEW').catch('UNDER_REVIEW'), // 탭
    page: z.number().optional(),
    search: z.string().optional(),
    partId: z.number().optional(),
    semesterId: z.number().optional(),
  }),
});
