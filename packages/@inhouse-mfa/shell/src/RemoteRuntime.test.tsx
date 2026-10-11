import { defineRemotePlugin, RouteRegistry } from '@inhouse-mfa/core';
import { queryClient } from '@inhouse/query-client';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createContext, useContext } from 'react';
import { renderToString } from 'react-dom/server';

import { graftPlugin } from './graft';
import { RemoteOutlet, RemoteRuntime } from './RemoteRuntime';

const LabelContext = createContext('missing provider');

const makePlugin = (name: string, fail = false) => {
  const Leaf = () => <output>{useContext(LabelContext)}</output>;
  const root = createRootRoute({
    component: () => (
      <LabelContext.Provider value={name}>
        <section data-remote-root={name}>
          <Outlet />
        </section>
      </LabelContext.Provider>
    ),
    errorComponent: ({ error }) => <output data-remote-error={name}>{error.message}</output>,
  });
  const auth = createRoute({
    getParentRoute: () => root,
    id: '/_auth',
    component: () => (
      <>
        <output data-standalone-global={name}>standalone</output>
        <Outlet />
      </>
    ),
  });
  const branch = createRoute({
    getParentRoute: () => auth,
    path: `/${name}`,
    component: Leaf,
    beforeLoad: () => {
      if (fail) {
        throw new Error('remote loader failed');
      }
    },
  });
  // Match the generated file route's id/path pair at the Router API boundary.
  branch.update({ id: `/${name}`, path: `/${name}`, getParentRoute: () => auth } as never);
  root.addChildren([auth.addChildren([branch])]);
  return defineRemotePlugin({
    name,
    global: { Global: () => <output data-global={name}>{useContext(LabelContext)}</output> },
    routes: { basePath: `/${name}`, entry: '/_auth', routeTree: root },
  });
};

const makeHost = (plugins: ReturnType<typeof makePlugin>[]) => {
  const root = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    ),
  });
  const auth = createRoute({ getParentRoute: () => root, id: '/_auth', component: RemoteOutlet });
  root.addChildren([auth]);
  const registry = new RouteRegistry();
  for (const plugin of plugins) {
    graftPlugin(auth, plugin, registry);
  }
  return createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/member'] }),
    InnerWrap: ({ children }) => <RemoteRuntime plugins={plugins}>{children}</RemoteRuntime>,
  });
};

test('retains remote root providers and layouts without changing file route ids', async () => {
  const router = makeHost([makePlugin('member')]);
  await router.load();
  const html = renderToString(<RouterProvider router={router} />);
  assert.match(html, /data-remote-root="member"/);
  assert.match(html, /<output>member<\/output>/);
  assert.match(html, /data-global="member"/);
  assert.match(html, /data-global="member">member<\/output>/);
  assert.doesNotMatch(html, /data-standalone-global/);
  assert.ok(Object.hasOwn(router.routesById, '/_auth/member'));
});

test('selects the new remote root and Global after navigation', async () => {
  const router = makeHost([makePlugin('member'), makePlugin('scouter')]);
  await router.load();
  await router.navigate({ to: '/scouter' });
  const html = renderToString(<RouterProvider router={router} />);
  assert.match(html, /data-remote-root="scouter"/);
  assert.match(html, /data-global="scouter"/);
  assert.doesNotMatch(html, /data-global="member"/);
  assert.doesNotMatch(html, /data-remote-root="member"/);
});

test('uses the remote root error component for a failed route load', async () => {
  const router = makeHost([makePlugin('member', true)]);
  await router.load();
  const html = renderToString(<RouterProvider router={router} />);
  assert.match(html, /data-remote-error="member"/);
  assert.match(html, /remote loader failed/);
});

test('does not require a Global export', async () => {
  const plugin = makePlugin('member');
  plugin.global = {};
  const router = makeHost([plugin]);
  await router.load();
  const html = renderToString(<RouterProvider router={router} />);
  assert.match(html, /data-remote-root="member"/);
  assert.doesNotMatch(html, /data-global/);
});

test('retains root head declarations alongside branch declarations', async () => {
  const plugin = makePlugin('member');
  plugin.routes.routeTree.update({
    head: () => ({
      meta: [{ title: 'Remote title' }],
      links: [{ rel: 'icon', href: '/icon.svg' }],
    }),
  });
  const entry = plugin.routes.routeTree.children?.[0];
  const branch = entry?.children?.[0];
  assert.ok(branch);
  branch.update({
    head: () => ({ meta: [{ name: 'description', content: 'Branch description' }] }),
  });
  const router = makeHost([plugin]);
  await router.load();
  const match = router.state.matches.find((route) => route.routeId === '/_auth/member');
  assert.deepEqual(match?.meta, [
    { title: 'Remote title' },
    { name: 'description', content: 'Branch description' },
  ]);
  assert.deepEqual(match?.links, [{ rel: 'icon', href: '/icon.svg' }]);
});

test('shares the shell QueryClient with a grafted remote loader and component', async () => {
  const queryKey = ['RemoteRuntime', 'shared-client'];
  const plugin = makePlugin('member');
  const branch = plugin.routes.routeTree.children?.[0]?.children?.[0];
  assert.ok(branch);
  const Page = () => {
    const client = useQueryClient();
    assert.equal(client, queryClient);
    return <output>{client.getQueryData<string>(queryKey)}</output>;
  };
  branch.update({
    loader: () => queryClient.ensureQueryData({ queryKey, queryFn: async () => 'shared cache' }),
    component: Page,
  });

  try {
    const router = makeHost([plugin]);
    await router.load();
    const html = renderToString(<RouterProvider router={router} />);
    assert.match(html, /<output>shared cache<\/output>/);
    await queryClient.invalidateQueries({ queryKey });
    assert.equal(queryClient.getQueryState(queryKey)?.isInvalidated, true);
  } finally {
    queryClient.removeQueries({ queryKey });
  }
});
