import './styles/index.css';

import { createRemotePreviewApp } from '@yourssu-inhouse/mfa-shell';

import { authConfig } from '@/config';
import { plugin } from '@/plugin';
import { routeTree } from '@/routeTree.gen';

/*
  scouter 는 Module Federation remote("scouter")예요. shell 이 단일 라우터·인증·크롬을 소유해요.
  이 main.tsx 는 remote dev preview·빌드 entry 용이고, shell 은 `./plugin` manifest 만 소비해요.

  예전 standalone "독립 앱" 이 아니라 remote dev preview harness 예요. createRemotePreviewApp 가:
  - shell 크롬/인증 없이 recruit 서브트리만 렌더하고,
  - AuthProvider 를 dev authConfig 로 mount 해 인증을 진짜로 동작시키며(독립 앱인 척하는 착시 제거),
  - 미가입 시 /signin redirect 가 remote 에 없는 route 여도 PreviewAuthNotice 로 솔직히 안내하고,
  - PreviewBanner 로 shell 없는 미리보기임을 항상 표시해요.
  graft·assets 주입은 하지 않아요(로컬 routeTree 가 곧 host 자신의 entry 라 self-double-add 되고,
  preview 자기 entry CSS 가 utilities 까지 커버해요). plugins: [plugin] 으로 init/mocks 만 재사용해요.
*/
const app = createRemotePreviewApp({
  authConfig,
  plugin,
  queryClientConfig: {
    defaultOptions: {
      queries: {
        throwOnError: true,
      },
    },
  },
  routeTree,
});

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
