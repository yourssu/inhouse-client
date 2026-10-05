import type { PropsWithChildren } from 'react';

import { createExteriorApp } from '@exterior/core';
import { queryClient } from '@inhouse/query-client';
import { QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useRouter,
} from '@tanstack/react-router';
import assert from 'node:assert/strict';
import { createContext, useContext } from 'react';
import { renderToString } from 'react-dom/server';
import { test, vi } from 'vitest';

vi.mock('@interior/react', () => ({
  initializeTheme: () => {},
  ThemeProvider: ({ children }: PropsWithChildren) => children,
  ToastProvider: ({ children }: PropsWithChildren) => children,
}));

test('shares the QueryClient between loaders and an explicit Provider while retaining typed routes', async () => {
  const queryKey = ['createExteriorApp', 'shared-client'];
  const fetchValue = vi.fn(async () => 'cached');
  const Scope = createContext('missing');
  const Page = () => {
    assert.equal(useQueryClient(), queryClient);
    const { data } = useQuery({ queryKey, queryFn: fetchValue, staleTime: Infinity });
    return (
      <output>
        {useContext(Scope)}:{data}
      </output>
    );
  };

  const root = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <Scope.Provider value="service">
          <Outlet />
        </Scope.Provider>
      </QueryClientProvider>
    ),
  });
  const route = createRoute({
    getParentRoute: () => root,
    path: '/probe',
    component: Page,
    loader: () => queryClient.ensureQueryData({ queryKey, queryFn: fetchValue }),
  });
  const routeTree = root.addChildren([route]);
  const app = createExteriorApp({
    routeTree,
    routerOptions: { history: createMemoryHistory({ initialEntries: ['/probe'] }) },
  });

  const validPath: keyof typeof app.router.routesByPath = '/probe';
  // @ts-expect-error The platform factory must retain the service's route paths.
  const invalidPath: keyof typeof app.router.routesByPath = '/unknown';
  void validPath;
  void invalidPath;

  try {
    await app.router.load();
    assert.equal(app.router.options.defaultPreloadStaleTime, 0);
    assert.deepEqual(queryClient.getDefaultOptions(), {
      queries: { refetchOnWindowFocus: false, retry: false },
    });
    const html = renderToString(<RouterProvider router={app.router} />);
    assert.match(html, /service<!-- -->:<!-- -->cached/);
    assert.equal(fetchValue.mock.calls.length, 1);
    await queryClient.invalidateQueries({ queryKey });
    assert.equal(queryClient.getQueryState(queryKey)?.isInvalidated, true);
  } finally {
    queryClient.removeQueries({ queryKey });
  }
});

test('renders a standalone app with explicit Providers and Global inside the router context', async () => {
  const Global = () => {
    assert.equal(useRouter(), router);
    assert.equal(useQueryClient(), queryClient);
    return <output>global ready</output>;
  };
  const Page = () => {
    assert.equal(useQueryClient(), queryClient);
    return <output>page ready</output>;
  };
  const root = createRootRoute({ component: Outlet });
  const auth = createRoute({
    getParentRoute: () => root,
    id: '/_auth',
    component: () => (
      <>
        <Global />
        <Outlet />
      </>
    ),
  });
  const route = createRoute({ getParentRoute: () => auth, path: '/', component: Page });
  const router = createRouter({
    routeTree: root.addChildren([auth.addChildren([route])]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  await router.load();
  const html = renderToString(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  assert.match(html, /<output>global ready<\/output>/);
  assert.match(html, /<output>page ready<\/output>/);
});
