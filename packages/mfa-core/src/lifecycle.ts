import type { RequestHandler } from 'msw';

import type { ExteriorAppMode, RemotePlugin } from './types';

const isDev = (): boolean => (import.meta as any).env?.DEV ?? false;

/*
  모든 plugin 의 init side effect 를 실행해요. init 이 없는 plugin 은 건너뛰고,
  Promise.all 이 non-promise 반환(void)도 처리해요.
*/
export const runPluginInits = async (
  plugins: readonly RemotePlugin[],
  mode: ExteriorAppMode,
): Promise<void> => {
  await Promise.all(plugins.map((plugin) => plugin.lifecycle?.init?.({ mode, name: plugin.name })));
};

/*
  MSW 중앙 관리. dev 에서만 모든 plugin 의 mocks 핸들러를 모아 단일 worker 로 실행해요.
  다수 worker 충돌을 피하기 위해 하나의 setupWorker 로 묶고, onUnhandledRequest: 'bypass' 로
  plugin 이 mock 하지 않는 요청(예: scouter 의 실제 API)을 통과시켜요. prod 에선 아무 것도 안 해요.
*/
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
