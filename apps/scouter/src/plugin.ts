import { defineRemotePlugin, type RemotePlugin } from '@yourssu-inhouse/mfa-core';

import { routeTree } from '@/routeTree.gen';

/*
  scouter remote 의 Plugin manifest export예요. shell 은 `loadRemote('scouter/plugin')` 로
  이 객체를 가져와 routes graft / lifecycle(init/mocks) 을 계약대로 소비해요.
  preview(main.tsx)도 동일 export 를 재사용해요.

  - routes.entry '/_auth': mfa-core 가 gen routeTree 에서 이 자식을 찾아 검증해요.
  - routes.basePath '/recruit': graft 충돌 검사가 다른 plugin 과 basePath 가 겹치지 않는지 확인해요.
  - mocks: scouter 는 비즈니스 API 를 실제 scouter-dev-api 로 호출해서 mock 이 없어요. shell 의
    중앙 MSW worker 가 onUnhandledRequest: 'bypass' 로 scouter 요청을 통과시켜요.

  remote 전용 Tailwind utility(tiptap selector, @utility 포함)는 shell 이 host Tailwind 빌드의
  @source glob 으로 apps 아래 모든 src 를 스캔해 단일 CSS 에 생성해요. standalone preview 의
  @utility·tiptap 선언은 styles/runtime.css(=utility.css+tiptap.css) 를 index.css 가 @import 해
  그대로 재사용해요. 그래서 이 plugin 이 CSS 를 따로 노출하지 않아요.
*/
export const plugin: RemotePlugin = defineRemotePlugin({
  name: 'scouter',
  routes: { basePath: '/recruit', entry: '/_auth', routeTree },
});
