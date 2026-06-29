import { createFileRoute, Outlet } from '@tanstack/react-router';

/*
  scouter remote 의 pathless _auth 패스스루예요.
  shell 의 _auth 가 인증 가드·PageLayout 크롬을 소유해요. remote _auth 는 graft 시
  최상위 기능 라우트(/recruit)의 부모로만 쓰이고, 자신은 shell 라우터에 노출되지 않아요.
  이 인스턴스를 그대로 두어 routeTree.gen 의 `/_auth/recruit/...` routeId 가 유지돼요.
*/
export const Route = createFileRoute('/_auth')({
  component: () => <Outlet />,
});
