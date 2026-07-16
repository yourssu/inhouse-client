import { createFileRoute, redirect } from '@tanstack/react-router';

/*
  shell 의 루트(/) 진입점이에요. 앱 조립(Module Federation) 후 실제로 보여줄 기본 서비스는
  멤버(member) 서비스(/members)예요. shell 은 remote 내부 라우트 구조를 정적으로 알지 못하므로
  /members 는 런타임 graft 결과로 존재해요. SPA 내전환으로 보내기 위해 to 를 써요. /members 는 member 쪽 beforeLoad 에서 /members/list 로
  다시 전환돼요.
*/
export const Route = createFileRoute('/_auth/')({
  beforeLoad: () => {
    throw redirect({ to: '/members' });
  },
});
