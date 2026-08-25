import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect, trimPathRight } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { useUnmountOverlaysOnRouteChange } from '@yourssu-inhouse/mfa-core';
import { overlay, OverlayProvider } from 'overlay-kit';
import { useEffect } from 'react';
import { FcBusinessContact, FcCalendar, FcFeedback, FcPuzzle } from 'react-icons/fc';

import {
  identifyScouterUser,
  resetScouterAnalytics,
  setScouterUserProperties,
} from '@/analytics/client';
import { meOption } from '@/apis/members/query';
import { partsOption } from '@/apis/parts/query';
import { semestersNowOption, semestersOption } from '@/apis/semesters/query';
import { AdaptiveLogo } from '@/components/AdaptiveLogo';
import { DevTools } from '@/components/DevTools';
import { STAGE } from '@/config';

const RouteComponent = () => {
  const { data: me } = useSuspenseQuery(meOption());

  /* 스카우터 앱 마운트시 Mixpanel에서 사용자를 식별하고, 라우트 해제 시 사용자 식별 정보를 초기화한다. */
  useEffect(() => {
    identifyScouterUser(me.userId);

    return resetScouterAnalytics;
  }, [me.userId]);

  /* 사용자 정보가 갱신되어도 identity를 초기화하지 않고 People Property만 최신 값으로 동기화한다. */
  useEffect(() => {
    setScouterUserProperties(me);
  }, [me]);

  useUnmountOverlaysOnRouteChange(overlay.unmountAll);

  return (
    <OverlayProvider>
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
        logo={<AdaptiveLogo className="h-5" />}
      />
      <Outlet />
      {STAGE === 'dev' && <DevTools />}
    </OverlayProvider>
  );
};

export const Route = createFileRoute('/_auth/recruit')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: '유어슈 인하우스 | 스카우터' }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(meOption()),
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
