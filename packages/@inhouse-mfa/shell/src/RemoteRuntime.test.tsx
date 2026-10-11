/// <reference lib="es2024.promise" />

import type { RemoteGlobal, RemoteGlobalProps } from '@inhouse-mfa/core';

import {
  defineRemotePlugin,
  findPluginEntryRoute,
  REMOTE_GLOBAL_UPDATE_EVENT,
  RouteRegistry,
} from '@inhouse-mfa/core';
import { queryClient } from '@inhouse/query-client';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  type AnyRouter,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  RouterProvider,
} from '@tanstack/react-router';
import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { createContext, useContext } from 'react';
import { renderToString } from 'react-dom/server';

import { graftPlugin } from './graft';
import { getRemoteGlobalLifecycle } from './remoteGlobalLifecycle';
import { connectRemoteRuntime, RemoteOutlet } from './RemoteRuntime';

const LabelContext = createContext('missing');
const makePlugin = (name: string) => {
  const root = createRootRoute({
    component: () => <output>obsolete root</output>,
    head: () => ({ meta: [{ title: 'obsolete root' }] }),
    errorComponent: () => <output>obsolete root error</output>,
  });
  const auth = createRoute({
    getParentRoute: () => root,
    id: '/_auth',
    component: () => <output>obsolete auth</output>,
  });
  const branch = createRoute({
    getParentRoute: () => auth,
    path: `/${name}`,
    component: () => <output>{name}</output>,
    errorComponent: ({ error }) => <output data-service-error={name}>{error.message}</output>,
    head: () => ({ meta: [{ title: name }] }),
  });
  branch.update({ id: `/${name}`, path: `/${name}`, getParentRoute: () => auth } as never);
  root.addChildren([auth.addChildren([branch])]);
  return defineRemotePlugin({
    name,
    routes: { basePath: `/${name}`, entry: '/_auth', routeTree: root },
  });
};
const branchOf = (plugin: ReturnType<typeof makePlugin>) => {
  const branch = findPluginEntryRoute(plugin).children?.[0];
  assert.ok(branch);
  return branch;
};
const makeHost = (
  plugins: ReturnType<typeof makePlugin>[],
  authEntryId = '/_auth',
  guard?: () => void,
) => {
  const root = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    ),
  });
  const auth = createRoute({
    getParentRoute: () => root,
    id: authEntryId,
    component: RemoteOutlet,
    beforeLoad: guard,
  });
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <output>home</output>,
  });
  root.addChildren([home, auth]);
  const registry = new RouteRegistry();
  plugins.forEach((plugin) => graftPlugin(auth, plugin, registry));
  const router: AnyRouter = createRouter({
    isServer: false,
    origin: 'http://localhost',
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/member'] }),
  });
  const disconnect = connectRemoteRuntime(router, plugins);
  return { router, disconnect };
};

test('uses service configuration and ignores remote root/auth without changing ids', async () => {
  const plugin = makePlugin('member');
  const { router, disconnect } = makeHost([plugin]);
  try {
    await router.load();
    const html = renderToString(<RouterProvider router={router} />);
    assert.match(html, /<output>member<\/output>/);
    assert.doesNotMatch(html, /obsolete/);
    assert.ok(Object.hasOwn(router.routesById, '/_auth/member'));
    assert.deepEqual(router.state.matches.at(-1)?.meta, [{ title: 'member' }]);
  } finally {
    disconnect();
  }
});

test('renders Global children under service providers and shell QueryClient', async () => {
  const plugin = makePlugin('member');
  plugin.global = async () => ({
    Global: ({ children }) => (
      <LabelContext.Provider value="service provider">{children}</LabelContext.Provider>
    ),
  });
  const Page = () => {
    assert.equal(useQueryClient(), queryClient);
    return <output>{useContext(LabelContext)}</output>;
  };
  branchOf(plugin).update({ component: Page });
  const { router, disconnect } = makeHost([plugin]);
  try {
    await router.load();
    assert.match(renderToString(<RouterProvider router={router} />), /service provider/);
  } finally {
    disconnect();
  }
});

test('awaits bootstrap after shell auth and before service guards and descendant loaders', async () => {
  const events: string[] = [];
  const plugin = makePlugin('member');
  const branch = branchOf(plugin);
  plugin.global = async () => ({
    bootstrap: async () => {
      events.push('bootstrap');
      await Promise.resolve();
      events.push('ready');
    },
  });
  branch.update({
    beforeLoad: () => {
      events.push('service guard');
    },
    loader: () => {
      assert.ok(events.includes('ready'));
      events.push('service loader');
    },
  });
  const child = createRoute({
    getParentRoute: () => branch,
    path: '/',
    beforeLoad: () => {
      events.push('child guard');
    },
    loader: () => {
      assert.ok(events.includes('ready'));
      events.push('child loader');
    },
  });
  branch.addChildren([child]);
  const { router, disconnect } = makeHost([plugin], '/_auth', () => {
    events.push('auth');
  });
  try {
    await router.load();
    assert.deepEqual(events.slice(0, 5), [
      'auth',
      'bootstrap',
      'ready',
      'service guard',
      'child guard',
    ]);
    assert.ok(events.includes('service loader') && events.includes('child loader'));
  } finally {
    disconnect();
  }
});

test('waits for replacement bootstrap when HMR interrupts an ongoing entry', async () => {
  const started = Promise.withResolvers<void>();
  const finish = Promise.withResolvers<void>();
  const nextStarted = Promise.withResolvers<void>();
  const nextFinish = Promise.withResolvers<void>();
  const events: string[] = [];
  const plugin = makePlugin('member');
  plugin.global = async () => ({
    bootstrap: async () => {
      events.push('old start');
      started.resolve();
      await finish.promise;
      return () => events.push('old stop');
    },
  });
  branchOf(plugin).update({
    beforeLoad: () => events.push('guard'),
    loader: () => events.push('loader'),
  });
  const { router, disconnect } = makeHost([plugin]);
  try {
    const loading = router.load();
    await started.promise;
    const updating = getRemoteGlobalLifecycle(plugin)!.update({
      bootstrap: async () => {
        events.push('new start');
        nextStarted.resolve();
        await nextFinish.promise;
        events.push('new ready');
      },
    });
    finish.resolve();
    await nextStarted.promise;
    assert.deepEqual(events, ['old start', 'old stop', 'new start']);
    nextFinish.resolve();
    await Promise.all([loading, updating]);
    assert.deepEqual(events, [
      'old start',
      'old stop',
      'new start',
      'new ready',
      'guard',
      'loader',
    ]);
  } finally {
    disconnect();
  }
});

test('does not initialize when shell auth rejects service entry', async () => {
  const plugin = makePlugin('member');
  plugin.global = async () => assert.fail('global loaded before authentication');
  const { router, disconnect } = makeHost([plugin], '/_auth', () => {
    throw redirect({ to: '/' });
  });
  try {
    await router.load();
    assert.equal(router.state.location.pathname, '/');
  } finally {
    disconnect();
  }
});

test('skips inactive service preloads, but permits preloads inside an initialized service', async () => {
  let starts = 0;
  let loads = 0;
  const member = makePlugin('member');
  const scouter = makePlugin('scouter');
  member.global = async () => ({
    bootstrap: () => {
      starts += 1;
    },
  });
  scouter.global = async () => assert.fail('inactive service initialized by preload');
  branchOf(member).update({
    loader: () => {
      loads += 1;
    },
  });
  branchOf(scouter).update({ loader: () => assert.fail('inactive service loader ran') });
  const { router, disconnect } = makeHost([member, scouter]);
  try {
    await router.preloadRoute({ to: '/member' });
    assert.equal(starts, 0);
    assert.equal(loads, 0);
    await router.load();
    await router.preloadRoute({ to: '/scouter' });
    await router.preloadRoute({ to: '/member' });
    assert.equal(starts, 1);
    assert.ok(loads > 0);
  } finally {
    disconnect();
  }
});

test('keeps bootstrap on internal navigation and cleans up on service exit and re-entry', async () => {
  const events: string[] = [];
  const plugin = makePlugin('member');
  plugin.global = async () => ({
    bootstrap: () => {
      events.push('start');
      return () => events.push('stop');
    },
  });
  const branch = branchOf(plugin);
  branch.addChildren([createRoute({ getParentRoute: () => branch, path: '/detail' })]);
  const { router, disconnect } = makeHost([plugin]);
  try {
    await router.load();
    await router.navigate({ to: '/member/detail' });
    assert.deepEqual(events, ['start']);
    await router.navigate({ to: '/' });
    assert.deepEqual(events, ['start', 'stop']);
    await router.navigate({ to: '/member' });
    assert.deepEqual(events, ['start', 'stop', 'start']);
  } finally {
    disconnect();
  }
});

test('cleans up a service whose guard redirects before its component mounts', async () => {
  const events: string[] = [];
  const plugin = makePlugin('member');
  plugin.global = async () => ({
    bootstrap: () => {
      events.push('start');
      return () => events.push('stop');
    },
  });
  branchOf(plugin).update({
    beforeLoad: () => {
      throw redirect({ to: '/' });
    },
  });
  const { router, disconnect } = makeHost([plugin]);
  try {
    await router.load();
    assert.deepEqual(events, ['start', 'stop']);
  } finally {
    disconnect();
  }
});

test('cleans up a cancelled asynchronous bootstrap even without a mounted component', async () => {
  const started = Promise.withResolvers<void>();
  const finish = Promise.withResolvers<void>();
  const events: string[] = [];
  const plugin = makePlugin('member');
  plugin.global = async () => ({
    bootstrap: async () => {
      events.push('start');
      started.resolve();
      await finish.promise;
      return () => events.push('stop');
    },
  });
  const { router, disconnect } = makeHost([plugin]);
  try {
    const initial = router.load();
    await started.promise;
    await router.navigate({ to: '/' });
    finish.resolve();
    await initial;
    await getRemoteGlobalLifecycle(plugin)?.release();
    assert.deepEqual(events, ['start', 'stop']);
    assert.equal(router.state.location.pathname, '/');
  } finally {
    finish.resolve();
    disconnect();
  }
});

test('waits for an exited service to finish cleanup before initializing another service', async () => {
  const started = Promise.withResolvers<void>();
  const authenticated = Promise.withResolvers<void>();
  const finish = Promise.withResolvers<void>();
  const events: string[] = [];
  const member = makePlugin('member');
  const scouter = makePlugin('scouter');
  member.global = async () => ({
    bootstrap: async () => {
      events.push('member start');
      started.resolve();
      await finish.promise;
      return () => events.push('member stop');
    },
  });
  scouter.global = async () => ({
    bootstrap: () => {
      events.push('scouter start');
    },
  });
  branchOf(member).update({ loader: () => assert.fail('cancelled service loader ran') });
  branchOf(scouter).update({ loader: () => events.push('scouter loader') });
  let entries = 0;
  const { router, disconnect } = makeHost([member, scouter], '/_auth', () => {
    entries += 1;
    if (entries === 2) {
      authenticated.resolve();
    }
  });
  try {
    const initial = router.load();
    await started.promise;
    const next = router.navigate({ to: '/scouter' });
    await authenticated.promise;
    assert.deepEqual(events, ['member start']);
    finish.resolve();
    await Promise.all([initial, next]);
    assert.deepEqual(events, ['member start', 'member stop', 'scouter start', 'scouter loader']);
  } finally {
    finish.resolve();
    disconnect();
  }
});

test('uses the service error component for bootstrap failure and supports retry', async () => {
  const plugin = makePlugin('member');
  let fail = true;
  plugin.global = async () => ({
    bootstrap: () => {
      if (fail) {
        throw new Error('bootstrap failed');
      }
    },
  });
  const { router, disconnect } = makeHost([plugin]);
  try {
    await router.load();
    const match = router.state.matches.find((match) => match.routeId === '/_auth/member');
    assert.equal(match?.status, 'error');
    assert.equal((match?.error as Error).message, 'bootstrap failed');
    assert.equal(
      router.routesById['/_auth/member'].options.errorComponent,
      branchOf(plugin).options.errorComponent,
    );
    fail = false;
    await router.invalidate({ sync: true });
    assert.match(renderToString(<RouterProvider router={router} />), /<output>member<\/output>/);
  } finally {
    disconnect();
  }
});

test('preserves the Global wrapper and initialization guard across lazy loading and branch HMR', async () => {
  const plugin = makePlugin('member');
  plugin.global = async () => ({
    Global: ({ children }) => <section data-global="member">{children}</section>,
  });
  const branch = branchOf(plugin);
  const lazyPage = () => <output>lazy page</output>;
  branch.lazy(async () => ({ options: { id: '/_auth/member', component: lazyPage } }));
  const { router, disconnect } = makeHost([plugin]);
  try {
    const component = branch.options.component;
    const beforeLoad = branch.options.beforeLoad;
    await router.load();
    assert.equal(branch.options.component, component);
    assert.equal(branch.options.beforeLoad, beforeLoad);
    branch.options = { ...branch.options, head: () => ({ meta: [{ title: 'updated' }] }) };
    branch.update(branch.options);
    await router.invalidate({ sync: true });
    assert.equal(branch.options.component, component);
    assert.equal(branch.options.beforeLoad, beforeLoad);
    assert.deepEqual(router.state.matches.at(-1)?.meta, [{ title: 'updated' }]);
    const html = renderToString(<RouterProvider router={router} />);
    assert.match(html, /data-global="member"/);
    assert.match(html, /lazy page/);
  } finally {
    disconnect();
  }
});

test('retains ids beneath a custom shell auth anchor', async () => {
  const { router, disconnect } = makeHost([makePlugin('member')], '/_private');
  try {
    await router.load();
    assert.ok(Object.hasOwn(router.routesById, '/_private/member'));
  } finally {
    disconnect();
  }
});

for (const change of ['component', 'bootstrap']) {
  test(`${change} HMR updates only the service lifetime without re-running route guards or loaders`, async (context) => {
    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const events = new EventTarget();
    Object.defineProperty(globalThis, 'window', { configurable: true, value: events });
    context.after(() => {
      if (previousWindow) {
        Object.defineProperty(globalThis, 'window', previousWindow);
      } else {
        Reflect.deleteProperty(globalThis, 'window');
      }
    });
    const calls = {
      auth: 0,
      shellLoader: 0,
      serviceGuard: 0,
      serviceLoader: 0,
      starts: 0,
      stops: 0,
    };
    const bootstrap = () => {
      calls.starts += 1;
      return () => {
        calls.stops += 1;
      };
    };
    const Global = ({ children }: RemoteGlobalProps) => (
      <section data-global="initial">{children}</section>
    );
    const plugin = makePlugin('member');
    plugin.global = async () => ({ bootstrap, Global });
    branchOf(plugin).update({
      beforeLoad: () => {
        calls.serviceGuard += 1;
      },
      loader: () => {
        calls.serviceLoader += 1;
      },
    });
    const { router, disconnect } = makeHost([plugin], '/_auth', () => {
      calls.auth += 1;
    });
    router.routesById['/_auth'].update({
      loader: () => {
        calls.shellLoader += 1;
      },
    });
    const invalidate = context.mock.method(router, 'invalidate');
    const lifecycle = getRemoteGlobalLifecycle(plugin)!;
    const next: RemoteGlobal =
      change === 'component'
        ? {
            bootstrap,
            Global: ({ children }) => <section data-global="updated">{children}</section>,
          }
        : { bootstrap: () => bootstrap(), Global };
    try {
      await router.load();
      const revision = lifecycle.getSnapshot().revision;
      const published = Promise.withResolvers<void>();
      const unsubscribe = lifecycle.subscribe(() => {
        const state = lifecycle.getSnapshot();
        if (state.status === 'ready' && state.global === next) {
          published.resolve();
        }
      });
      context.after(unsubscribe);
      events.dispatchEvent(
        new CustomEvent(REMOTE_GLOBAL_UPDATE_EVENT, {
          detail: { name: plugin.name, global: next },
        }),
      );
      await published.promise;
      await setImmediate();
      assert.equal(invalidate.mock.callCount(), 0);
      assert.deepEqual(calls, {
        auth: 1,
        shellLoader: 1,
        serviceGuard: 1,
        serviceLoader: 1,
        starts: change === 'bootstrap' ? 2 : 1,
        stops: change === 'bootstrap' ? 1 : 0,
      });
      assert.equal(lifecycle.getSnapshot().revision, revision + (change === 'bootstrap' ? 1 : 0));
      const html = renderToString(<RouterProvider router={router} />);
      assert.match(
        html,
        change === 'component' ? /data-global="updated"/ : /data-global="initial"/,
      );
      assert.match(html, /<output>member<\/output>/);
    } finally {
      disconnect();
    }
  });
}

test('cleanup failure does not interrupt navigation or the next service entry', async (context) => {
  const report = context.mock.method(console, 'error', () => {});
  let starts = 0;
  const plugin = makePlugin('member');
  plugin.global = async () => ({
    bootstrap: () => {
      starts += 1;
      return () => {
        if (starts === 1) {
          throw new Error('cleanup failed');
        }
      };
    },
  });
  const { router, disconnect } = makeHost([plugin]);
  try {
    await router.load();
    await router.navigate({ to: '/' });
    assert.equal(router.state.location.pathname, '/');
    assert.equal(getRemoteGlobalLifecycle(plugin)?.getSnapshot().status, 'idle');
    assert.equal(report.mock.callCount(), 1);
    assert.equal(report.mock.calls[0].arguments[0], "[mfa-shell] 'member' cleanup failed");
    await router.navigate({ to: '/member' });
    assert.equal(starts, 2);
    assert.equal(getRemoteGlobalLifecycle(plugin)?.getSnapshot().status, 'ready');
  } finally {
    disconnect();
  }
});
