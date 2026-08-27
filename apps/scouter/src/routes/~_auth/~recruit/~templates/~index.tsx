import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
import { Button } from '@yourssu-inhouse/interior';
import { SearchField } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
import { overlay } from 'overlay-kit';
import { Suspense, useCallback, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { z } from 'zod/v4';

import type {
  TemplateAnalyticsCommonProperties,
  TrackTemplateEvent,
} from '@/routes/~_auth/~recruit/~templates/analytics';

import { trackScouterEvent } from '@/analytics/client';
import { TemplateEditorDialog } from '@/components/TemplateEditorDialog';
import { useSearchState } from '@/hooks/useSearchState';
import { TemplateAnalyticsContext } from '@/routes/~_auth/~recruit/~templates/analytics';
import { TemplatesTable } from '@/routes/~_auth/~recruit/~templates/components/TemplatesTable';

const RouteComponent = () => {
  const [search, setSearch] = useSearchState({ from: '/_auth/recruit/templates/' });
  const setSearchKeyword = useSetStateSelector(setSearch, 'search');
  const [keyword, setKeyword] = useState<string>(search.search ?? '');
  const trackTemplateEvent = useCallback<TrackTemplateEvent>((eventName, properties) => {
    const commonProperties: TemplateAnalyticsCommonProperties = {
      event_schema_version: 'v1',
    };

    trackScouterEvent(eventName, { ...commonProperties, ...properties });
  }, []);

  const handleCreateTemplate = () => {
    trackTemplateEvent('template_create_click', {});
    overlay.openAsync<boolean>(({ close, isOpen }) => {
      return (
        <TemplateEditorDialog
          closeAsFalse={() => close(false)}
          closeAsTrue={() => close(true)}
          isOpen={isOpen}
          mode="생성"
          onSubmitComplete={() => trackTemplateEvent('template_create_complete', {})}
        />
      );
    });
  };

  return (
    <TemplateAnalyticsContext.Provider value={trackTemplateEvent}>
      <PageLayout.Content
        description="지원자에게 보낼 메일 양식을 미리 만들고 관리할 수 있어요."
        right={
          <Button
            className="p-2 pr-2.5"
            left={<MdAdd className="size-4.5" />}
            onClick={handleCreateTemplate}
            size="lg"
          >
            템플릿 생성
          </Button>
        }
        title="템플릿"
      >
        <div className="flex flex-[1_1_0] gap-4 pt-3.5">
          <div className="bg-lightBackground h-fit min-w-180 grow rounded-xl px-3 pt-1 pb-3">
            <div className="mb-2 px-1 pt-3">
              <SearchField
                className="w-60"
                disabled
                onChange={(v) => {
                  setSearchKeyword(v);
                  setKeyword(v);
                }}
                // placeholder="이름으로 검색"
                // Todo: 템플릿 api에 search 필요
                placeholder="아직 검색을 지원하지 않아요"
                size="md"
                value={keyword}
                variant="outline"
              />
            </div>
            <Suspense fallback={<Table.Skeleton count={10} />}>
              <TemplatesTable />
            </Suspense>
          </div>
        </div>
      </PageLayout.Content>
    </TemplateAnalyticsContext.Provider>
  );
};

export const Route = createFileRoute('/_auth/recruit/templates/')({
  component: RouteComponent,
  validateSearch: z.object({
    page: z.number().optional().default(1),
    search: z.string().optional(),
  }),
});
