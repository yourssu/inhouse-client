import type { RequestHandler } from 'msw';

import type { ExteriorAppMode, RemotePlugin } from './types';

// NOTE: 로컬 dev 환경이거나, 배포 환경에서 MSW를 키도록 환경 변수를 셋업한 경우에만 MSW를 켜요.
const isMSWEnabled = (): boolean => {
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
  if (!isMSWEnabled()) {
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
