import type { AnyRoute } from '@tanstack/react-router';

import { loadRemote } from '@module-federation/runtime';
import { PLUGIN_EXPOSE_KEY, type RemotePlugin, RouteRegistry } from '@yourssu-inhouse/mfa-core';

import { graftPlugin } from './graft';

export interface RemotePluginSpec {
  /** Module Federation remote 이름(mfa.config remote id 와 일치). */
  name: string;
}

interface ComposedPluginsResult {
  /** 로드에 실패한 plugin 이름들. shell 이 unavailable UI 로 노출해요. */
  failures: readonly string[];
  /** 성공적으로 graft 된 plugin 들. lifecycle 을 태울 대상이에요. */
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
      const mod = await loadRemote<{ plugin: RemotePlugin }>(`${spec.name}/${expose}`);
      if (!mod?.plugin) {
        throw new Error(`[mfa-shell] '${spec.name}' did not expose a plugin manifest`);
      }
      if (mod.plugin.name !== spec.name) {
        throw new Error(
          `[mfa-shell] loaded '${spec.name}' but plugin manifest declared '${mod.plugin.name}'`,
        );
      }
      if (graftPlugin(hostEntry, mod.plugin, registry)) {
        plugins.push(mod.plugin);
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
