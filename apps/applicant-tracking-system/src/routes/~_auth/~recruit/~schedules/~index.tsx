import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@yourssu-inhouse/interior';
import { Suspense } from 'react';
import { MdAdd } from 'react-icons/md';
import { z } from 'zod/v4';

import { PageLayout } from '@/components/PageLayout';

import { MonthlyCalendar } from './components/MonthlyCalendar';
import { WeeklyCalendar } from './components/WeeklyCalendar';

const RouteComponent = () => {
  const { ct } = Route.useSearch();

  return (
    <PageLayout.Content
      right={
        <Link to="/recruit/schedules/new">
          <Button className="pr-2.5 pl-2" left={<MdAdd className="size-4.5" />} size="lg">
            일정 생성
          </Button>
        </Link>
      }
      title="면접 일정"
    >
      <Suspense>{ct === '주별' ? <WeeklyCalendar /> : <MonthlyCalendar />}</Suspense>
    </PageLayout.Content>
  );
};

export const Route = createFileRoute('/_auth/recruit/schedules/')({
  component: RouteComponent,
  validateSearch: z.object({
    ct: z.enum(['월별', '주별']).optional().default('월별'), // 캘린더 타입
    pid: z.number().optional(), // 파트 필터 id
  }),
});
