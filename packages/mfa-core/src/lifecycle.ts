import type { RequestHandler } from 'msw';

import type { ExteriorAppMode, RemotePlugin } from './types';

const isDev = (): boolean => (import.meta as any).env?.DEV ?? false;

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
  if (!isDev()) {
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
