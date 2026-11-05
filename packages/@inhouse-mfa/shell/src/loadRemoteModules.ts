import type { AnyRoute } from '@tanstack/react-router';

import { PLUGIN_EXPOSE_KEY, type RemotePlugin } from '@inhouse-mfa/core';

import type { RemotePluginSpec } from './composePlugins';

export interface RemoteModule {
  global?: RemotePlugin['global'];
  routeTree: AnyRoute;
}

export const loadRemoteModules = (
  specs: readonly RemotePluginSpec[],
  load: (id: string) => Promise<null | RemoteModule>,
  timeoutMs = 15_000,
) =>
  Promise.allSettled(
    specs.map(async ({ name }) => {
      let timeout: ReturnType<typeof setTimeout> | undefined;

      try {
        return await Promise.race([
          load(`${name}/${PLUGIN_EXPOSE_KEY.replace(/^\.?\//, '')}`),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(
              () => reject(new Error(`[mfa-shell] '${name}' load timed out after ${timeoutMs}ms`)),
              timeoutMs,
            );
          }),
        ]);
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
