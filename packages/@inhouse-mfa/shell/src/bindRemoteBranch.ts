import type { RemotePlugin } from '@inhouse-mfa/core';
import type { AnyRoute } from '@tanstack/react-router';

import { getRemoteGlobalLifecycle, prepareRemoteGlobal } from './remoteGlobalLifecycle';
import { withRemoteGlobal } from './withRemoteGlobal';

interface RemoteBeforeLoadContext {
  abortController: AbortController;
  preload: boolean;
}

export const bindRemoteBranch = (route: AnyRoute, hostEntry: AnyRoute, plugin: RemotePlugin) => {
  let options = route.options;
  const getParentRoute = () => hostEntry;
  const lifecycle = getRemoteGlobalLifecycle(plugin);
  const Component = lifecycle
    ? withRemoteGlobal(
        () => options.component,
        plugin,
        () => options.pendingComponent,
      )
    : undefined;
  const beforeLoad: NonNullable<AnyRoute['options']['beforeLoad']> = async (
    context: RemoteBeforeLoadContext,
  ) => {
    if (lifecycle && !context.preload) {
      const signal = context.abortController.signal;
      // HMR may replace an unfinished bootstrap while this navigation is still active.
      while (!signal.aborted) {
        const global = await prepareRemoteGlobal(plugin, signal);
        if (global) {
          break;
        }
      }

      if (signal.aborted) {
        return;
      }
    }

    return options.beforeLoad?.(context);
  };

  const createOptions = () =>
    new Proxy(options, {
      get(target, key, receiver) {
        if (key === 'getParentRoute') {
          return getParentRoute;
        }
        if (key === 'component' && Component) {
          return Component;
        }
        if (key === 'beforeLoad' && lifecycle) {
          return beforeLoad;
        }
        return Reflect.get(target, key, receiver);
      },
      set(target, key, value) {
        if (
          (key === 'component' && value === Component) ||
          (key === 'beforeLoad' && value === beforeLoad)
        ) {
          return true;
        }
        return Reflect.set(target, key, value);
      },
    });

  let boundOptions = createOptions();

  // Lazy routes mutate options; TanStack HMR replaces the options object entirely.
  Object.defineProperty(route, 'options', {
    configurable: true,
    enumerable: true,
    get: () => boundOptions,
    set: (next: AnyRoute['options']) => {
      if (next === boundOptions) {
        return;
      }
      options = {
        ...next,
        component: next.component === Component ? options.component : next.component,
        beforeLoad: next.beforeLoad === beforeLoad ? options.beforeLoad : next.beforeLoad,
      };
      boundOptions = createOptions();
    },
  });
};
