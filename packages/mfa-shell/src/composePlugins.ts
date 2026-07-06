import type { AnyRoute } from '@tanstack/react-router';

import { loadRemote } from '@module-federation/runtime';
import {
  type MfaRemoteEntry,
  PLUGIN_EXPOSE_KEY,
  type RemotePlugin,
  RouteRegistry,
} from '@yourssu-inhouse/mfa-core';

import { graftPlugin } from './graft';

/*
  shell 이 런타임에 조립할 remote Plugin 목록이에요. shell 이 아는 건 MF remote 이름뿐이고,
  expose 키(`./plugin`)는 고정 계약이라 설정에 드러나지 않아요. mfa.config 의 remotes 로부터
  buildRemoteSpecs() 로 생성해요. graft/init/mocks 로직은 이 레지스트리 위로 generic 하게
  동작해 더 이상 건드리지 않아도 돼요.
*/
export interface RemotePluginSpec {
  /** Module Federation remote 이름(mfa.config remote id 와 일치). */
  name: string;
}

export interface ComposedPluginsResult {
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

/*
  레지스트리의 remote plugin 들을 로드하고, 각 plugin 의 entry children 을 host(shell)의
  entry route 아래로 graft 해요. 한 remote 실패가 전체 shell 을 죽이지 않도록 plugin 단위로
  격리해요 — 로드·graft 실패 시 해당 plugin 만 failures 에 담고 나머지는 계속 조립해요.
  반환된 plugins 는 bootstrapShell 이 init/mocks lifecycle 의 대상으로 써요.
*/
export const composePlugins = async (
  hostEntry: AnyRoute,
  specs: readonly RemotePluginSpec[],
): Promise<ComposedPluginsResult> => {
  const registry = new RouteRegistry();
  const plugins: RemotePlugin[] = [];
  const failures: string[] = [];

  for (const spec of specs) {
    // loadRemote 는 `remoteName/<expose>` 형식에서 expose 앞의 `./` 를 허용하지 않아요.
    // expose 키(`./plugin`)는 고정 계약이라 상수에서 파생해요.
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
      // per-plugin isolation: graft 충돌·loadRemote 실패 시 해당 plugin 만 격리해요.
      console.error(`[mfa-shell] plugin '${spec.name}' unavailable`, error);
      failures.push(spec.name);
    }
  }

  return { failures, plugins };
};

/*
  mfa.config 의 remotes 를 shell runtime 레지스트리 spec 으로 변환해요.
  remote 추가 시 plugins.config 한 줄도 직접 쓰지 않고 mfa.config 에서 파생해요.
*/
export const buildRemoteSpecs = (remotes: readonly MfaRemoteEntry[]): readonly RemotePluginSpec[] =>
  remotes.map((remote) => ({ name: remote.id }));
