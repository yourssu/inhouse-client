import { defineRemotePlugin, type RemotePlugin } from '@yourssu-inhouse/mfa-core';

import { routeTree } from '@/routeTree.gen';

export const plugin: RemotePlugin = defineRemotePlugin({
  name: 'member',
  routes: { basePath: '/members', entry: '/_auth', routeTree },
  lifecycle: {
    // shell 안에서는 scouter 등 다른 remote가 같은 apiBaseURL(진짜 백엔드)을 쓰므로 mock을 등록하지 않는다.
    // member를 단독으로 띄우는 preview 모드에서만 mock을 사용한다.
    mocks: async ({ mode }) =>
      mode === 'preview' ? (await import('@/mocks/handlers')).handlers : [],
  },
});
