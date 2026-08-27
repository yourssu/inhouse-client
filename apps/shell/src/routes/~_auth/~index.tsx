import { createFileRoute, redirect } from '@tanstack/react-router';

/*
  shell 의 루트(/) 진입점이에요. member 서비스는 아직 준비중이라 접근이 막혀 있어서(#186),
  기본 서비스로 스카우터(scouter) 서비스(/recruit)를 보여줘요. shell 은 remote 내부 라우트
  구조를 정적으로 알지 못하므로 /recruit 는 런타임 graft 결과로 존재해요. SPA 내전환으로
  보내기 위해 to 를 써요.
*/
export const Route = createFileRoute('/_auth/')({
  beforeLoad: () => {
    throw redirect({ to: '/recruit' });
  },
});
