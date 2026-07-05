import { createFileRoute, Outlet, redirect, trimPathRight } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { FcBusinessContact, FcCalendar, FcFeedback, FcPuzzle } from 'react-icons/fc';

import { partsOption } from '@/apis/parts/query';
import { semestersNowOption, semestersOption } from '@/apis/semesters/query';

const RouteComponent = () => {
  return (
    <>
      <PageLayout.TabSection
        items={[
          {
            content: '지원자',
            to: '/recruit/applicants',
            icon: <FcBusinessContact />,
          },
          {
            content: '면접 일정',
            to: '/recruit/schedules',
            icon: <FcCalendar />,
          },
          {
            content: '템플릿',
            to: '/recruit/templates',
            icon: <FcPuzzle />,
          },
          {
            content: '메일 관리',
            to: '/recruit/mail',
            icon: <FcFeedback />,
          },
        ]}
      />
      <Outlet />
    </>
  );
};

export const Route = createFileRoute('/_auth/recruit')({
  component: RouteComponent,
  // graft 후 shell 라우터의 context.queryClient 로 recruit 자식 페이지들이 쓰는 옵션을 프리패치해요.
  // meOption 은 mail/new 에서 on-demand 로 가져와요.
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(partsOption()),
      context.queryClient.ensureQueryData(semestersOption()),
      context.queryClient.ensureQueryData(semestersNowOption()),
    ]);
  },
  beforeLoad: ({ location }) => {
    const href = trimPathRight(location.href);
    if (href === '/recruit') {
      throw redirect({
        to: '/recruit/applicants',
      });
    }
  },
});
