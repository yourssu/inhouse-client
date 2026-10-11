import type { RemotePlugin } from '@inhouse-mfa/core';
import type { AnyRoute, AnyRouter } from '@tanstack/react-router';

import {
  findPluginEntryRoute,
  REMOTE_GLOBAL_UPDATE_EVENT,
  type RemoteGlobalUpdate,
} from '@inhouse-mfa/core';
import { Outlet } from '@tanstack/react-router';

import { getRemoteGlobalLifecycle, registerRemoteGlobalGroup } from './remoteGlobalLifecycle';

const matchesRemote = (plugin: RemotePlugin, routeIds: readonly string[]) =>
  ((findPluginEntryRoute(plugin).children ?? []) as AnyRoute[]).some((branch) =>
    routeIds.some((id) => id === branch.id || id.startsWith(`${branch.id}/`)),
  );

export const connectRemoteRuntime = (router: AnyRouter, plugins: readonly RemotePlugin[]) => {
  registerRemoteGlobalGroup(plugins);
  const findRemote = (routeIds: readonly string[]) =>
    plugins.find((plugin) => matchesRemote(plugin, routeIds));
  const releaseExcept = (active?: RemotePlugin) => {
    plugins
      .filter((plugin) => plugin !== active)
      .forEach((plugin) => {
        void getRemoteGlobalLifecycle(plugin)?.release();
      });
  };

  const unsubscribers = [
    router.subscribe('onBeforeNavigate', ({ toLocation }) => {
      const target = findRemote(router.matchRoutes(toLocation).map((match) => match.routeId));
      releaseExcept(target);
      const lifecycle = target && getRemoteGlobalLifecycle(target);
      if (lifecycle && lifecycle.getSnapshot().status === 'error') {
        void lifecycle.release();
      }
    }),
    router.subscribe('onResolved', () => {
      releaseExcept(
        findRemote(
          router.state.matches
            .filter((match) => match.status === 'success')
            .map((match) => match.routeId),
        ),
      );
    }),
  ];

  const preloadRoute = router.preloadRoute;
  const guardedPreload: typeof router.preloadRoute = (options) => {
    const target = findRemote(
      router
        .matchRoutes(
          // Both APIs consume navigation options; their generic search reducers differ in AnyRouter.
          router.buildLocation(options as Parameters<AnyRouter['buildLocation']>[0]),
        )
        .map((match) => match.routeId),
    );
    const lifecycle = target && getRemoteGlobalLifecycle(target);
    // An inactive service's preload must not install global effects or run dependent loaders.
    if (lifecycle && lifecycle.getSnapshot().status !== 'ready') {
      return Promise.resolve(undefined);
    }
    return preloadRoute(options);
  };
  router.preloadRoute = guardedPreload;

  const updateGlobal = (event: Event) => {
    const { name, global } = (event as CustomEvent<RemoteGlobalUpdate>).detail;
    const plugin = plugins.find((candidate) => candidate.name === name);
    const lifecycle = plugin && getRemoteGlobalLifecycle(plugin);
    if (!lifecycle) {
      return;
    }
    // Global observes lifecycle state; refreshing it does not require another route load.
    void lifecycle.update(global).catch((error: unknown) => {
      console.error(`[mfa-shell] '${name}' global refresh failed`, error);
    });
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(REMOTE_GLOBAL_UPDATE_EVENT, updateGlobal);
  }

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    if (router.preloadRoute === guardedPreload) {
      router.preloadRoute = preloadRoute;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener(REMOTE_GLOBAL_UPDATE_EVENT, updateGlobal);
    }
    releaseExcept();
  };
};

export const RemoteOutlet = Outlet;
