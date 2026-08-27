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
import { Suspense, useCallback, useState } from 'react';
import { z } from 'zod/v4';

import type {
  ApplicantsAnalyticsCommonProperties,
  TrackApplicantsEvent,
} from '@/routes/~_auth/~recruit/~applicants/analytics';

import { trackScouterEvent } from '@/analytics/client';
import { partsOption } from '@/apis/parts/query';
import { semestersOption } from '@/apis/semesters/query';
import { Paper } from '@/components/Paper';
import { SemesterSelect } from '@/components/SemesterSelect';
import { useSearchState } from '@/hooks/useSearchState';
import { ApplicantsAnalyticsContext } from '@/routes/~_auth/~recruit/~applicants/analytics';
import { ApplicantsTable } from '@/routes/~_auth/~recruit/~applicants/components/ApplicantsTable';
import { applicantTabNameKo } from '@/routes/~_auth/~recruit/~applicants/type';
import { formatRecruitingSemester } from '@/utils/semester';

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

  const { data: parts } = useSuspenseQuery(partsOption());
  const { data: semesters } = useSuspenseQuery(semestersOption());
  const selectedPart = parts.find(({ partId }) => partId === search.partId);
  const selectedSemester = semesters.find(({ semesterId }) => semesterId === search.semesterId);
  const selectedSemesterLabel = selectedSemester
    ? formatRecruitingSemester(selectedSemester)
    : undefined;
  const trackApplicantsEvent = useCallback<TrackApplicantsEvent>((eventName, properties) => {
    const commonProperties: ApplicantsAnalyticsCommonProperties = {
      event_schema_version: 'v1',
    };

    trackScouterEvent(eventName, { ...commonProperties, ...properties });
  }, []);

  return (
    <ApplicantsAnalyticsContext.Provider value={trackApplicantsEvent}>
      <PageLayout.Content title="지원자">
        <ChipTab
          onTabChange={(t) => {
            const nextTab = applicantTabNameEn[t];

            if (nextTab !== search.t) {
              trackApplicantsEvent('applicant_tab_selected', { current_tab: nextTab });
            }

            setters.page(undefined);
            setters.t(nextTab);
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
                        const hasSearchQuery = keyword.length > 0;
                        const nextHasSearchQuery = v.length > 0;

                        if (hasSearchQuery !== nextHasSearchQuery) {
                          trackApplicantsEvent('applicant_filter_changed', {
                            current_tab: search.t,
                            has_search_query: nextHasSearchQuery,
                            ...(selectedPart === undefined
                              ? {}
                              : { selected_part: selectedPart.partName }),
                            ...(search.partId === undefined
                              ? {}
                              : { selected_part_id: search.partId }),
                            ...(selectedSemesterLabel === undefined
                              ? {}
                              : { selected_semester: selectedSemesterLabel }),
                          });
                        }

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
                        if (v.semesterId !== search.semesterId) {
                          trackApplicantsEvent('applicant_filter_changed', {
                            current_tab: search.t,
                            has_search_query: keyword.length > 0,
                            ...(selectedPart === undefined
                              ? {}
                              : { selected_part: selectedPart.partName }),
                            ...(search.partId === undefined
                              ? {}
                              : { selected_part_id: search.partId }),
                            selected_semester: formatRecruitingSemester(v),
                          });
                        }

                        setters.semesterId(v.semesterId);
                        setters.page(undefined);
                      }}
                      size="md"
                      value={selectedSemesterLabel}
                      variant="outline"
                    />
                    {(search.partId || search.semesterId) && (
                      <InlineButton
                        className="text-violet600 text-sm font-medium underline"
                        onClick={() => {
                          trackApplicantsEvent('applicant_filter_changed', {
                            current_tab: search.t,
                            has_search_query: keyword.length > 0,
                          });
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
                    selectedSemester={selectedSemesterLabel}
                    semesterId={search.semesterId}
                    tab={applicantTabNameEn[tab]}
                  />
                </Suspense>
              </Paper>
            </div>
          )}
        </ChipTab>
      </PageLayout.Content>
    </ApplicantsAnalyticsContext.Provider>
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
