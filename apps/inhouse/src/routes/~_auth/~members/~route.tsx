import { createFileRoute, Outlet, redirect, trimPathRight } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { FcConferenceCall } from 'react-icons/fc';

/*
  mm 의 /members 서브트리 진입 라우트예요.
  기존엔 _auth 레벨에 있던 TabSection(멤버 관리)이 graft 후 사라지므로 여기로 옮겼어요.
  사이드바 접기 상태는 Sidebar·TabSection 이 localStorage(useStorageState)로 직접 공유해요.
*/
export const Route = createFileRoute('/_auth/members')({
  component: () => (
    <>
      <PageLayout.TabSection
        items={[
          {
            content: '멤버 관리',
            to: '/members/list',
            icon: <FcConferenceCall />,
          },
        ]}
      />
      <Outlet />
    </>
  ),
  beforeLoad: ({ location }) => {
    const href = trimPathRight(location.href);
    if (href === '/members') {
      throw redirect({
        to: '/members/list',
      });
    }
  },
});
