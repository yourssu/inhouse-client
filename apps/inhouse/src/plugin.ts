import { defineRemotePlugin, type RemotePlugin } from '@yourssu-inhouse/mfa-core';

import { routeTree } from '@/routeTree.gen';

/*
  inhouse remote 의 Plugin manifest export예요. shell 은 `loadRemote('inhouse/plugin')` 로
  이 객체를 가져와 routes graft / lifecycle(init/mocks) 을 계약대로 소비해요.
  preview(main.tsx)도 동일 export 를 재사용해요.

  - routes.entry '/_auth' / routes.basePath '/members': mfa-core 가 gen routeTree 에서 entry
    자식을 찾아 basePath 위반·충돌을 정의 시점에 검증해요. 실패하면 런타임이 아니라 여기서 throw 해요.
  - lifecycle.mocks: inhouse 의 MSW 핸들러. dev 에서 shell 의 중앙 worker 로 묶여 실행돼요.

  remote 전용 Tailwind utility 는 shell 이 host Tailwind 빌드의 @source glob 으로 apps 아래
  모든 src 를 스캔해 단일 CSS 에 생성해요. 그래서 이 plugin 이 CSS 를 따로 노출하지 않아요.
*/
export const plugin: RemotePlugin = defineRemotePlugin({
  name: 'inhouse',
  routes: { basePath: '/members', entry: '/_auth', routeTree },
  lifecycle: {
    mocks: async () => (await import('@/mocks/handlers')).handlers,
  },
});
