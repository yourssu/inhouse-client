import type { AnyRoute } from '@tanstack/react-router';

import {
  defineRemotePlugin,
  findRouteById,
  PLUGIN_EXPOSE_KEY,
  type RemotePlugin,
  RouteRegistry,
} from '@inhouse-mfa/core';
import { loadRemote } from '@module-federation/runtime';

import { graftPlugin } from './graft';

export interface RemotePluginSpec {
  /** Module Federation remote 이름(mfa.config workspace name과 일치). */
  name: string;
}

interface ComposedPluginsResult {
  /** 로드에 실패한 plugin 이름들. shell 이 unavailable UI 로 노출해요. */
  failures: readonly string[];
  /** 성공적으로 graft 된 plugin 들. */
  plugins: readonly RemotePlugin[];
}

export const composePlugins = async (
  hostEntry: AnyRoute,
  specs: readonly RemotePluginSpec[],
): Promise<ComposedPluginsResult> => {
  const registry = new RouteRegistry();
  const plugins: RemotePlugin[] = [];
  const failures: string[] = [];

  for (const spec of specs) {
    const expose = PLUGIN_EXPOSE_KEY.replace(/^\.?\//, '');
    try {
      const mod = await loadRemote<{ global?: RemotePlugin['global']; routeTree: AnyRoute }>(
        `${spec.name}/${expose}`,
      );
      if (!mod?.routeTree) {
        throw new Error(`[mfa-shell] '${spec.name}' did not expose routeTree`);
      }
      const entry = findRouteById(mod.routeTree, '/_auth');
      const child = (entry?.children as AnyRoute[] | undefined)?.[0];
      const basePath = child && 'path' in child.options ? child.options.path : undefined;
      if (!basePath) {
        throw new Error(`[mfa-shell] '${spec.name}' has no route branch to graft`);
      }
      const plugin = defineRemotePlugin({
        name: spec.name,
        global: mod.global,
        routes: { basePath, entry: '/_auth', routeTree: mod.routeTree },
      });
      if (graftPlugin(hostEntry, plugin, registry)) {
        plugins.push(plugin);
      }
    } catch (error) {
      console.error(`[mfa-shell] plugin '${spec.name}' unavailable`, error);
      failures.push(spec.name);
    }
  }

  return { failures, plugins };
};

export const buildRemoteSpecs = (remotes: readonly { id: string }[]): readonly RemotePluginSpec[] =>
  remotes.map((remote) => ({ name: remote.id }));
