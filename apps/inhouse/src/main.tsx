import './styles/index.css';

import { createRemotePreviewApp } from '@yourssu-inhouse/mfa-shell';

import { authConfig } from '@/config';
import { plugin } from '@/plugin';
import { routeTree } from '@/routeTree.gen';

/*
  remote dev preview·빌드 entry예요. shell 이 조립하는 것과 동일 Plugin manifest export 를
  재사용해요 — mocks 핸들러 소스가 plugin 에 하나만 있어요.

  예전 standalone "독립 앱" 이 아니라 remote dev preview harness 예요. createRemotePreviewApp 가
  shell 크롬/인증 없이 전체 routeTree(/_auth/members + /test)를 렌더하고, AuthProvider 를 dev
  authConfig 로 mount 해 인증을 진짜로 동작시키며(착시 제거), 미가입 시 PreviewAuthNotice 로 안내하고,
  PreviewBanner 로 shell 없는 미리보기임을 표시해요. graft·assets 주입은 하지 않아요(로컬 routeTree
  가 곧 host 자신의 entry 라 self-double-add 되고, preview 자기 entry CSS 가 utilities 까지 커버해요).
  init/mocks lifecycle 만 재사용해요.
*/
const app = createRemotePreviewApp({ authConfig, plugin, routeTree });

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
