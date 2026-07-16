import type { RequestHandler } from 'msw';

import type { ExteriorAppMode, RemotePlugin } from './types';

// MSW 는 로컬 dev(import.meta.env.DEV) 또는 배포 dev 처럼 실제 백엔드가 없는 환경에서
// VITE_USE_MSW=true 로 켠다. production 빌드라도 host 가 이 env 로 모킹을 켤 수 있다.
const shouldUseMsw = (): boolean => {
  const env = (import.meta as any).env ?? {};
  return Boolean(env.DEV) || env.VITE_USE_MSW === 'true';
};

export const runPluginInits = async (
  plugins: readonly RemotePlugin[],
  mode: ExteriorAppMode,
): Promise<void> => {
  await Promise.all(plugins.map((plugin) => plugin.lifecycle?.init?.({ mode, name: plugin.name })));
};

export const setupPluginMocks = async (
  plugins: readonly RemotePlugin[],
  mode: ExteriorAppMode,
): Promise<void> => {
  if (!shouldUseMsw()) {
    return;
  }
  const handlers = (
    await Promise.all(
      plugins.map((plugin) => plugin.lifecycle?.mocks?.({ mode, name: plugin.name }) ?? []),
    )
  )
    .flat()
    .filter((handler): handler is RequestHandler => handler !== undefined);

  if (handlers.length === 0) {
    return;
  }

  const { setupWorker } = await import('msw/browser');
  await setupWorker(...handlers).start({ onUnhandledRequest: 'bypass' });
};
