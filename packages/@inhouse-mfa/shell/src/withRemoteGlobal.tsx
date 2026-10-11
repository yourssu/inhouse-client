import type { RemotePlugin } from '@inhouse-mfa/core';
import type { AnyRoute } from '@tanstack/react-router';

import { Outlet } from '@tanstack/react-router';
import { createElement, Suspense, useEffect, useSyncExternalStore } from 'react';

import { getRemoteGlobalLifecycle } from './remoteGlobalLifecycle';

export const withRemoteGlobal = (
  getComponent: () => AnyRoute['options']['component'],
  plugin: RemotePlugin,
  getPendingComponent: () => AnyRoute['options']['pendingComponent'],
) => {
  const lifecycle = getRemoteGlobalLifecycle(plugin);
  if (!lifecycle) {
    return getComponent() ?? Outlet;
  }

  let mounts = 0;
  const retain = () => {
    mounts += 1;
    return () => {
      mounts -= 1;
      // StrictMode replays effects before this microtask; a real unmount releases the service.
      queueMicrotask(() => {
        if (mounts === 0) {
          void lifecycle.release();
        }
      });
    };
  };

  const RemoteGlobalComponent = () => {
    const Component = getComponent() ?? Outlet;
    const Pending = getPendingComponent();
    const state = useSyncExternalStore(
      lifecycle.subscribe,
      lifecycle.getSnapshot,
      lifecycle.getSnapshot,
    );

    useEffect(retain, []);

    if (state.status === 'error') {
      throw state.error;
    }

    if (state.status !== 'ready') {
      return Pending ? createElement(Pending) : null;
    }

    const children = createElement(
      Suspense,
      { fallback: Pending ? createElement(Pending) : null, key: state.revision },
      createElement(Component),
    );
    const Global = state.global.Global;

    return Global ? <Global key={state.revision}>{children}</Global> : children;
  };

  return Object.assign(RemoteGlobalComponent, {
    preload: () => getComponent()?.preload?.(),
  });
};
