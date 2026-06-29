import './styles/index.css';

import type { AnyRoute } from '@tanstack/react-router';
import type { RequestHandler } from 'msw';

import { loadRemote } from '@module-federation/runtime';
import { createExteriorApp } from '@yourssu-inhouse/exterior';

import { routeTree as shellRouteTree } from '@/routeTree.gen';

/*
  shell 은 Module Federation host("shell")예요.
  createExteriorApp(→ createRouter) 직전에 두 remote 의 기능 라우트 서브트리를
  shell 의 _auth 아래에 정적 graft 해요. createRouter 가 buildRouteTree → processRouteTree 로
  각 route.init() 을 부모→자식 순서로 호출하며 getParentRoute/fullPath/routeId 를 재계산해요.
  그래서 routeId 가 `/_auth/recruit/...` · `/_auth/members/...` 로 유지돼 타입 안전해요.

  remote 의 routeTree 인스턴스는 init() 전이라 `route.id` 가 비어 있어요.
  gen 이 `.update({ id })` 로 설정한 `options.id`(세그먼트)로 자식을 찾아요.
*/
const findChildById = (route: AnyRoute | undefined, id: string): AnyRoute | undefined =>
  (route?.children as AnyRoute[] | undefined)?.find((c) => (c.options as any)?.id === id);

const loadRemoteWithRetry = async <T,>(
  id: string,
  attempts = 6,
  delayMs = 800,
): Promise<null | T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await loadRemote<T>(id);
    } catch (error) {
      if (i === attempts - 1) {
        console.error(`[shell] loadRemote('${id}') failed after ${attempts} attempts`, error);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
};

const graftRemotes = async (shellAuth: AnyRoute): Promise<void> => {
  // scouter: /recruit/* 서브트리
  const scouterModule = await loadRemoteWithRetry<{ routeTree: AnyRoute }>('scouter/routeTree');
  const scouterRecruit = findChildById(findChildById(scouterModule?.routeTree, '/_auth'), '/recruit');
  if (scouterRecruit) {
    // update 는 UpdatableRouteOptions 만 받지만, getParentRoute 재지정은 런타임 Object.assign 으로 동작해요.
    // gen 도 `as any` 로 동일하게 처리해요.
    scouterRecruit.update({ getParentRoute: () => shellAuth } as any);
  }

  // inhouse: /members/* 서브트리
  const inhouseModule = await loadRemoteWithRetry<{ routeTree: AnyRoute }>('inhouse/routeTree');
  const inhouseMembers = findChildById(findChildById(inhouseModule?.routeTree, '/_auth'), '/members');
  if (inhouseMembers) {
    inhouseMembers.update({ getParentRoute: () => shellAuth } as any);
  }

  // addChildren 는 children 을 교체하므로 기존 shell _auth 자식(/ index placeholder)을 보존해요.
  shellAuth.addChildren([
    ...(shellAuth.children ?? []),
    ...(scouterRecruit ? [scouterRecruit] : []),
    ...(inhouseMembers ? [inhouseMembers] : []),
  ]);
};

const enableMocking = async (): Promise<void> => {
  if (!import.meta.env.DEV) {
    return;
  }
  // inhouse 비즈니스 API(/api)를 shell 프로세스에서 mock 해요.
  // scouter 의 실제 scouter-dev-api 호출은 onUnhandledRequest: 'bypass' 로 통과시켜요.
  const { setupWorker } = await import('msw/browser');
  const handlersModule = await loadRemoteWithRetry<{ handlers: RequestHandler[] }>(
    'inhouse/mocks/handlers',
  );
  if (!handlersModule?.handlers) {
    return;
  }
  await setupWorker(...handlersModule.handlers).start({ onUnhandledRequest: 'bypass' });
};

const bootstrap = async () => {
  const shellAuth = findChildById(shellRouteTree as AnyRoute, '/_auth');
  if (!shellAuth) {
    throw new Error('shell /_auth route not found');
  }

  await graftRemotes(shellAuth);

  const app = createExteriorApp({ routeTree: shellRouteTree, beforeRender: enableMocking });
  void app.mount();
  return app;
};

const app = await bootstrap();

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
