import { createFileRoute, Link } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Button } from '@yourssu-inhouse/interior';
import { Suspense, useCallback } from 'react';
import { MdAdd } from 'react-icons/md';
import { z } from 'zod/v4';

import type {
  ScheduleAnalyticsCommonProperties,
  TrackScheduleEvent,
} from '@/routes/~_auth/~recruit/~schedules/analytics';

import { trackScouterEvent } from '@/analytics/client';

import { ScheduleAnalyticsContext } from './analytics';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { WeeklyCalendar } from './components/WeeklyCalendar';

const RouteComponent = () => {
  const { ct } = Route.useSearch();
  const trackScheduleEvent = useCallback<TrackScheduleEvent>((eventName, properties) => {
    const commonProperties: ScheduleAnalyticsCommonProperties = {
      event_schema_version: 'v1',
    };

    trackScouterEvent(eventName, { ...commonProperties, ...properties });
  }, []);

  return (
    <ScheduleAnalyticsContext.Provider value={trackScheduleEvent}>
      <PageLayout.Content
        right={
          <Link to="/recruit/schedules/new">
            <Button
              className="pr-2.5 pl-2"
              left={<MdAdd className="size-4.5" />}
              onClick={() => {
                trackScheduleEvent('schedule_create_click', {
                  calendar_view: ct === '주별' ? 'week' : 'month',
                });
              }}
              size="lg"
            >
              일정 생성
            </Button>
          </Link>
        }
        title="면접 일정"
      >
        <Suspense>{ct === '주별' ? <WeeklyCalendar /> : <MonthlyCalendar />}</Suspense>
      </PageLayout.Content>
    </ScheduleAnalyticsContext.Provider>
  );
};

export const Route = createFileRoute('/_auth/recruit/schedules/')({
  component: RouteComponent,
  validateSearch: z.object({
    ct: z.enum(['월별', '주별']).optional().default('월별'), // 캘린더 타입
    pid: z.number().optional(), // 파트 필터 id
  }),
});
