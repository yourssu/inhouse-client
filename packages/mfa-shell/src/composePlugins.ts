import type { AnyRoute } from '@tanstack/react-router';

import { loadRemote } from '@module-federation/runtime';
import {
  type MfaRemoteEntry,
  PLUGIN_EXPOSE_KEY,
  type RemotePlugin,
  RouteRegistry,
} from '@yourssu-inhouse/mfa-core';

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

const loadRemoteWithRetry = async <T>(
  id: string,
  attempts = 6,
  delayMs = 800,
): Promise<null | T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await loadRemote<T>(id);
    } catch (error) {
      if (i === attempts - 1) {
        console.error(`[mfa-shell] loadRemote('${id}') failed after ${attempts} attempts`, error);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
};

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
      const mod = await loadRemoteWithRetry<{ plugin: RemotePlugin }>(`${spec.name}/${expose}`);
      if (!mod?.plugin) {
        failures.push(spec.name);
        continue;
      }
      graftPlugin(hostEntry, mod.plugin, registry);
      plugins.push(mod.plugin);
    } catch (error) {
      console.error(`[mfa-shell] plugin '${spec.name}' unavailable`, error);
      failures.push(spec.name);
    }
  }

  return { failures, plugins };
};

export const buildRemoteSpecs = (remotes: readonly MfaRemoteEntry[]): readonly RemotePluginSpec[] =>
  remotes.map((remote) => ({ name: remote.id }));
