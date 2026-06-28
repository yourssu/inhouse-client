import { createFileRoute, Outlet, redirect, trimPathRight } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior';
import { FcBusinessContact, FcCalendar, FcFeedback, FcPuzzle } from 'react-icons/fc';


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
  beforeLoad: ({ location }) => {
    const href = trimPathRight(location.href);
    if (href === '/recruit') {
      throw redirect({
        to: '/recruit/applicants',
      });
    }
  },
});
