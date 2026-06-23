import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useState } from 'react';
import { z } from 'zod/v4';

import { ApplicantStateSchema } from '@/apis/applicants/schema';
import { semestersOption } from '@/apis/semesters/query';
import { ChipTab } from '@/components/_ui/ChipTab';
import { InlineButton } from '@/components/_ui/InlineButton';
import { SearchField } from '@/components/_ui/SearchField';
import { Table } from '@/components/_ui/Table';
import { PageLayout } from '@/components/PageLayout';
import { Paper } from '@/components/Paper';
import { SemesterSelect } from '@/components/SemesterSelect';
import { useMultiSelectActions } from '@/hooks/useMultiSelectActions';
import { useSearchState } from '@/hooks/useSearchState';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';
import { ApplicantSelectionBar } from '@/routes/~_auth/~recruit/~applicants/components/ApplicantSelectionBar';
import { ApplicantsTable } from '@/routes/~_auth/~recruit/~applicants/components/ApplicantsTable';
import { ApplicantSelectionContext } from '@/routes/~_auth/~recruit/~applicants/context';

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
            setters.t(t);
          }}
          tab={search.t}
          tabs={ApplicantStateSchema.options}
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
                    state={tab}
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

export const Route = createFileRoute('/_auth/recruit/applicants/')({
  component: RouteComponent,
  validateSearch: z.object({
    t: ApplicantStateSchema.default('심사 진행 중').catch('심사 진행 중'), // 탭
    page: z.number().optional(),
    search: z.string().optional(),
    partId: z.number().optional(),
    semesterId: z.number().optional(),
  }),
});
