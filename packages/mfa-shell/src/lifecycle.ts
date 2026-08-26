import type { RemotePlugin } from '@yourssu-inhouse/mfa-core';
import type { RequestHandler } from 'msw';

type ExteriorAppMode = 'preview' | 'shell';

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
